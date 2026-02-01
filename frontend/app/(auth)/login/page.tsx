"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  // ===== Auth state (preserved) =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ===== Login handler (preserved logic) =====
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      saveToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  }

  // ===== UI-only parallax effect =====
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const particles = document.querySelectorAll(".particle");
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      particles.forEach((particle, index) => {
        const speed = (index + 1) * 10;
        (particle as HTMLElement).style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* ================= Styles ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Work+Sans:wght@300;400;500&display=swap');

        :root {
          --primary: #0f172a;
          --accent: #f59e0b;
          --text: #334155;
          --text-light: #64748b;
          --background: #fafaf9;
          --surface: #ffffff;
          --border: #e2e8f0;
          --error: #dc2626;
        }

        body {
          font-family: 'Work Sans', sans-serif;
          background: var(--background);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        body::before {
          content: '';
          position: fixed;
          inset: -50%;
          background:
            radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.08), transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.06), transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.05), transparent 50%);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        .container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
        }

        .login-card {
          background: var(--surface);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.03),
            0 20px 25px -5px rgba(0, 0, 0, 0.08),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .logo {
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


        h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: var(--primary);
          margin-bottom: 6px;
        }

        .subtitle {
          color: var(--text-light);
          font-size: 15px;
          margin-bottom: 32px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 6px;
        }

        input {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--background);
          transition: all 0.25s ease;
        }

        input:focus {
          border-color: var(--accent);
          background: var(--surface);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
          outline: none;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 500;
          color: white;
          background: linear-gradient(135deg, var(--primary), #1e293b);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px rgba(15, 23, 42, 0.25);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          color: var(--error);
          font-size: 14px;
          margin-bottom: 16px;
        }

        .register-link {
          margin-top: 20px;
          text-align: center;
        }

        .register-link span {
          color: var(--text-light);
          font-size: 14px;
        }

        .register-button {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 28px;
          font-size: 15px;
          font-weight: 500;
          color: var(--accent);
          background: rgba(245, 158, 11, 0.08);
          border: 2px solid transparent;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .register-button:hover {
          background: rgba(245, 158, 11, 0.12);
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
          opacity: 0.3;
        }
      `}</style>

      {/* Decorative particles */}
      <div className="particle" />
      <div className="particle" />
      <div className="particle" />

      <div className="container">
        <div className="login-card">
          <div className="header">
            <div className="logo">AI LEARNING PLATFORM</div>
            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="login-button" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* ===== Register CTA ===== */}
          <div className="register-link">
            <span>New here?</span>
            <br />
            <Link href="/register" className="register-button">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
