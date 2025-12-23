import React, { useState } from "react";
import { toast } from "sonner";
import { API, setToken } from "../lib/api";

type LoginResponse = {
  access_token: string;
  token_type?: string;
};

type Props = {
  onLogin: () => void;
};

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API.commercial}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = (await res.json()) as LoginResponse;

      if (!data.access_token) {
        throw new Error("No token received");
      }

      setToken(data.access_token);
      toast.success("Login successful");
      onLogin();
    } catch (err) {
      toast.error("Invalid credentials or backend unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 420,
          backgroundColor: "#ffffff",
          borderRadius: 14,
          padding: "32px 28px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
            }}
          >
            🔒
          </div>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 6 }}>
          Welcome Back
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          AsusTec – Sales & Stock Management
        </p>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <label style={{ fontSize: 14, fontWeight: 500 }}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
            style={{
              width: "100%",
              padding: "12px 14px",
              marginTop: 6,
              marginBottom: 16,
              borderRadius: 8,
              border: "1px solid #cbd5f5",
              fontSize: 14,
            }}
          />

          {/* Password */}
          <label style={{ fontSize: 14, fontWeight: 500 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "12px 14px",
              marginTop: 6,
              marginBottom: 22,
              borderRadius: 8,
              border: "1px solid #cbd5f5",
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Secured with JWT Authentication
        </p>
      </div>
    </div>
  );
};

export default Login;
