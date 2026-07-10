import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { initEmail, sendOtpEmail } from "./services/email.js";
import { initSupabase, getClient } from "./services/supabase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize services
initEmail();
initSupabase();

// --- Auth Endpoints ---

// 1. Signup / Send OTP
app.post("/api/auth/signup", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const supabase = getClient();
  if (!supabase) return res.status(500).json({ error: "Supabase not connected" });

  // Check if user already exists
  const { data: existing } = await supabase.from("users").select("email").eq("email", email).single();
  if (existing) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  // Generate OTP (6 digits)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // Upsert OTP into Supabase
  const { error: dbError } = await supabase
    .from("otps")
    .upsert({ email, otp: otpCode, expires_at: expiresAt });

  if (dbError) {
    console.error(dbError);
    return res.status(500).json({ error: "Failed to store OTP" });
  }

  // Send Email
  const sent = await sendOtpEmail(email, otpCode);
  if (!sent) {
    return res.status(500).json({ error: "Failed to send email. Check SMTP settings." });
  }

  res.json({ message: "OTP sent successfully" });
});

// 2. Verify OTP & Set Password
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ error: "Email, OTP, and password are required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const supabase = getClient();
  
  // Fetch OTP
  const { data: record, error } = await supabase.from("otps").select("*").eq("email", email).single();
  
  if (error || !record || record.otp !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ error: "OTP has expired" });
  }

  // OTP is valid. Hash password and create user.
  const passwordHash = await bcrypt.hash(password, 10);
  
  const { error: insertError } = await supabase
    .from("users")
    .insert({ email, password_hash: passwordHash, verified: true });

  if (insertError) {
    return res.status(500).json({ error: "Failed to create user account" });
  }

  // Clean up OTP
  await supabase.from("otps").delete().eq("email", email);

  // In a real app we'd generate a JWT here. For the hackathon, we'll just return a success flag
  res.json({ message: "Account created successfully", token: "mock_jwt_token_" + Buffer.from(email).toString('base64') });
});

// 3. Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const supabase = getClient();
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ message: "Login successful", token: "mock_jwt_token_" + Buffer.from(email).toString('base64') });
});

// --- Incident Endpoint ---
app.post("/api/incidents", async (req, res) => {
  const incident = req.body;
  // incident must have region, district, category, address, description, etc.
  
  const supabase = getClient();
  if (!supabase) return res.status(500).json({ error: "Supabase not connected" });

  // Insert into Supabase (this will trigger Realtime for Police Portal)
  const { data, error } = await supabase
    .from("incidents")
    .insert([incident])
    .select();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to insert incident into cloud database" });
  }

  res.json({ message: "Incident reported", incident: data[0] });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SERVER] Citizen Cloud Backend running on port ${PORT}`);
});
