"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
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
      console.log("Registering with:", { name, email, password });
      
      // Register
      const registerData = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      console.log("Register response:", registerData);

      // Auto-login after registration
      const loginData = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response:", loginData);
      saveToken(loginData.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-950 via-black to-purple-900">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-purple-900"></div>
      
      {/* Animated mesh gradient orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header section with staggered animation */}
          <div className="text-center mb-12 space-y-3" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/50"
                style={{ animation: 'scaleIn 0.5s ease-out' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent"
              style={{ 
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                letterSpacing: '0.02em',
                animation: 'fadeInUp 0.6s ease-out 0.1s backwards'
              }}>
              CREATE ACCOUNT
            </h1>
            <p className="text-zinc-400 text-lg" style={{ 
              fontFamily: "'Space Mono', monospace",
              animation: 'fadeInUp 0.6s ease-out 0.2s backwards'
            }}>
              Start your AI learning journey
            </p>
          </div>

          {/* Form card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field */}
              <div className="group">
                <label className="block text-sm font-semibold text-zinc-400 mb-3 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/20 transition-all duration-300 group-hover:border-white/20"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 group-focus-within:from-violet-500/10 group-focus-within:via-fuchsia-500/10 group-focus-within:to-cyan-500/10 pointer-events-none transition-all duration-500"></div>
                </div>
              </div>

              {/* Email field */}
              <div className="group">
                <label className="block text-sm font-semibold text-zinc-400 mb-3 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/20 transition-all duration-300 group-hover:border-white/20"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 group-focus-within:from-violet-500/10 group-focus-within:via-fuchsia-500/10 group-focus-within:to-cyan-500/10 pointer-events-none transition-all duration-500"></div>
                </div>
              </div>

              {/* Password field */}
              <div className="group">
                <label className="block text-sm font-semibold text-zinc-400 mb-3 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/20 transition-all duration-300 group-hover:border-white/20"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 group-focus-within:from-violet-500/10 group-focus-within:via-fuchsia-500/10 group-focus-within:to-cyan-500/10 pointer-events-none transition-all duration-500"></div>
                </div>
                <p className="text-xs text-zinc-500 mt-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                  At least 6 characters
                </p>
              </div>

              {/* Confirm Password field */}
              <div className="group">
                <label className="block text-sm font-semibold text-zinc-400 mb-3 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-white/20 transition-all duration-300 group-hover:border-white/20"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 group-focus-within:from-violet-500/10 group-focus-within:via-fuchsia-500/10 group-focus-within:to-cyan-500/10 pointer-events-none transition-all duration-500"></div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                  style={{ animation: 'shake 0.5s ease-in-out' }}>
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    <>
                      CREATE ACCOUNT
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-zinc-500" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign in link */}
            <Link
              href="/login"
              className="group block w-full text-center py-4 px-6 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/5 hover:border-violet-500/50 transition-all duration-300"
              style={{ fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}
            >
              <span className="flex items-center justify-center gap-2">
                SIGN IN
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Footer text */}
          <p className="text-center text-zinc-600 text-xs mt-8" style={{ 
            fontFamily: "'Space Mono', monospace",
            animation: 'fadeInUp 0.6s ease-out 0.4s backwards'
          }}>
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

