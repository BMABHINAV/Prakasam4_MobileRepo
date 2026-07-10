const API_BASE = "http://localhost:3001/api"; // Cloud Backend

export const api = {
  // Auth
  signup: async (email) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Signup failed");
    return res.json();
  },

  verifyOtp: async (email, otp, password) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Verification failed");
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Login failed");
    return res.json();
  },

  // Post a new incident to Supabase via Cloud Backend
  reportIncident: async (data) => {
    try {
      // get token if we want to send it, but we aren't enforcing middleware yet.
      const res = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to submit report");
      }
      
      return await res.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  }
};
