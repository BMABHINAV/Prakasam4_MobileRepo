import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, EnvelopeSimple, LockKey, Spinner } from "@phosphor-icons/react";
import { api } from "../services/api";

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'verify'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleAuthSuccess = (token) => {
    localStorage.setItem("citizen_auth", "true");
    localStorage.setItem("citizen_token", token);
    navigate("/report");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      handleAuthSuccess(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.signup(email);
      setMessage(`OTP sent to ${email}`);
      setMode("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.verifyOtp(email, otp, password);
      handleAuthSuccess(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: "center", padding: "40px 24px", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ 
          width: "72px", height: "72px", 
          background: "var(--bg-main)", 
          borderRadius: "24px", 
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid var(--border)"
        }}>
          <ShieldCheck size={36} color="var(--primary)" weight="fill" />
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "12px", letterSpacing: "-0.5px" }}>Welcome back</h1>
        <p className="text-muted" style={{ fontSize: "16px" }}>Sign in to the Agastir Portal.</p>
      </div>

      {error && <div style={{ color: "var(--error)", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #fecaca" }}>{error}</div>}
      {message && <div style={{ color: "var(--success)", background: "#f0fdf4", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #bbf7d0" }}>{message}</div>}

      {/* LOGIN MODE */}
      {mode === "login" && (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}><EnvelopeSimple size={20} color="var(--text-muted)" /></div>
              <input type="email" className="form-input" style={{ paddingLeft: "48px" }} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}><LockKey size={20} color="var(--text-muted)" /></div>
              <input type="password" className="form-input" style={{ paddingLeft: "48px" }} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading} style={{ marginTop: "8px", padding: "16px", fontSize: "16px", fontWeight: "500", borderRadius: "12px" }}>
            {loading ? <Spinner className="animate-spin" /> : "Continue with Email"}
          </button>
          <div className="text-center" style={{ marginTop: "24px", fontSize: "14px" }}>
            Don't have an account? <a href="#" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setError(""); setMode("signup"); }}>Create one</a>
          </div>
        </form>
      )}

      {/* SIGNUP MODE */}
      {mode === "signup" && (
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}><EnvelopeSimple size={20} color="var(--text-muted)" /></div>
              <input type="email" className="form-input" style={{ paddingLeft: "48px" }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <p className="text-muted" style={{ fontSize: "12px", marginTop: "8px" }}>We will send an OTP to verify your email.</p>
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading} style={{ marginTop: "8px", padding: "16px", fontSize: "16px", fontWeight: "500", borderRadius: "12px" }}>
            {loading ? <Spinner className="animate-spin" /> : <>Continue with Email <ArrowRight size={18} /></>}
          </button>
          <div className="text-center" style={{ marginTop: "24px", fontSize: "14px" }}>
            Already have an account? <a href="#" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setError(""); setMode("login"); }}>Sign In</a>
          </div>
        </form>
      )}

      {/* VERIFY OTP MODE */}
      {mode === "verify" && (
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">Enter OTP</label>
            <input type="text" className="form-input" style={{ fontSize: "24px", letterSpacing: "8px", textAlign: "center" }} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Create a Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}><LockKey size={20} color="var(--text-muted)" /></div>
              <input type="password" className="form-input" style={{ paddingLeft: "48px" }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required minLength={6} />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading} style={{ marginTop: "8px", padding: "16px", fontSize: "16px", fontWeight: "500", borderRadius: "12px" }}>
            {loading ? <Spinner className="animate-spin" /> : "Verify & Create Account"}
          </button>
          <button type="button" className="btn btn--secondary" style={{ marginTop: "12px" }} onClick={() => { setError(""); setMessage(""); setMode("signup"); }}>
            Back to Email
          </button>
        </form>
      )}
    </div>
  );
}
