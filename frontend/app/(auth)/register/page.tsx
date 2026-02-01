"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function RegistrationPage() {
  const router = useRouter();

  // ---- logic from OLD page ----
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation (unchanged logic)
    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Register
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // Auto-login
      const loginData = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveToken(loginData.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'Inter', sans-serif;
          background: #e8e4e1;
          min-height: 100vh;
        }

        .registration-container {
          width: 100%;
          max-width: 480px;
          margin: auto;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .registration-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 48px 56px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .brand-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 10px 24px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          margin-bottom: 24px;
          display: inline-block;
        }

        .page-title {
          font-family: 'Libre Baskerville', serif;
          font-size: 36px;
          margin-bottom: 12px;
        }

        .page-subtitle {
          color: #718096;
          margin-bottom: 36px;
        }

        .form-group { margin-bottom: 24px; }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          display: block;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f7fafc;
          font-size: 15px;
        }

        .form-input:focus {
          outline: none;
          border-color: #f59e0b;
          background: white;
        }

        .error-box {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .register-button {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          background: #1a202c;
          color: white;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }

        .register-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          text-align: center;
          margin: 32px 0;
          color: #a0aec0;
          position: relative;
        }

        .login-section {
          text-align: center;
        }

        .login-link {
          display: inline-block;
          margin-top: 12px;
          padding: 12px 32px;
          background: #fef3c7;
          color: #d97706;
          border-radius: 12px;
          font-weight: 600;
        }
      `}</style>

      <div className="registration-container">
        <div className="registration-card">
          <div className="brand-badge">AI LEARNING PLATFORM</div>

          <h1 className="page-title">Create account</h1>
          <p className="page-subtitle">Start your learning journey today</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="divider">or</div>

          <div className="login-section">
            <p>Already have an account?</p>
            <Link href="/login" className="login-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
