import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

export default function AuthForm({ onAuthSuccess, currentTheme }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // Sandbox mode bypass
      onAuthSuccess({
        email: email || "sandbox@example.com",
        username: username || "SandboxUser",
        role: role
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              role: role
            }
          }
        });
        if (error) throw error;
        alert("Registration successful! Check your email for verification (if enabled) or log in.");
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Fetch user profile role from database
        const user = data.user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        onAuthSuccess({
          email: user.email,
          username: profile?.username || user.email.split("@")[0],
          role: profile?.role || "user",
          id: user.id
        });
      }
    } catch (err) {
      setErrorMessage(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxBypass = (selectedRole) => {
    onAuthSuccess({
      email: `${selectedRole}@sandbox.local`,
      username: `${selectedRole}Account`,
      role: selectedRole
    });
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - var(--header-height) - 100px)",
      padding: "24px"
    }}>
      <div className="card" style={{
        maxWidth: "450px",
        width: "100%",
        borderRadius: "var(--radius-lg)",
        padding: "36px",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "3rem" }}>🎨</span>
          <h2 style={{ fontSize: "1.8rem", marginTop: "12px", fontWeight: "800" }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            {isSupabaseConfigured() 
              ? "Access your assets and uploads securely" 
              : "Demo Sandbox: Supabase Keys not configured"}
          </p>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: "var(--danger-light)",
            color: "var(--danger)",
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            marginBottom: "20px",
            fontWeight: "500",
            border: "1px solid rgba(249, 49, 84, 0.15)"
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. GraphicPro" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@domain.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="form-label">I want to join as a:</label>
              <select 
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User (Search & Download)</option>
                <option value="contributor">Contributor (Submit Graphics)</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "12px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem" }}>
          <button 
            className="btn btn-outline" 
            style={{ border: "none", color: "var(--primary)", background: "none", cursor: "pointer", fontSize: "0.9rem" }}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage("");
            }}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>

        {/* Sandbox Quick Access Bypass Panel */}
        {!isSupabaseConfigured() && (
          <div style={{
            marginTop: "32px",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "24px",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "0.05em" }}>
              Quick Mock Login Bypass
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleSandboxBypass("user")}
                style={{ justifyContent: "flex-start", padding: "10px 16px" }}
              >
                👤 Enter as User (Consumer)
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleSandboxBypass("contributor")}
                style={{ justifyContent: "flex-start", padding: "10px 16px" }}
              >
                🎨 Enter as Contributor (Creator)
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleSandboxBypass("admin")}
                style={{ justifyContent: "flex-start", padding: "10px 16px" }}
              >
                🔑 Enter as Administrator (Reviewer)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
