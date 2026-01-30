"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await apiFetch<DashboardData>("/dashboard");
        setData(result);
      } catch (err: any) {
        setError(err.message);
        // Redirect to login if unauthorized
        if (err.message.includes("401")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8">No data found</div>;

  const { user, summary, roadmaps } = data;

  return (
    <>
      <Navbar />
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
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-12" style={{ animation: 'fadeInDown 0.6s ease-out' }}>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent mb-2"
                style={{ 
                  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  letterSpacing: '0.02em'
                }}>
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-zinc-400 text-lg">Keep up the momentum! Track your learning progress here.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12" style={{ animation: 'fadeInUp 0.6s ease-out 0.1s backwards' }}>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Overall Progress
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                      {summary.overall_completion_percentage}%
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Tasks Completed
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent mt-2">
                      {summary.completed_tasks}/{summary.total_tasks}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Total Modules
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                      {summary.total_modules}
                    </p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Roadmaps
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mt-2">
                      {summary.total_roadmaps}
                    </p>
                  </div>
                  <div className="text-4xl">🗺️</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-12" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}>
              <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Bebas Neue'" }}>Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/datasets"
                  className="group relative backdrop-blur-xl bg-gradient-to-r from-blue-600/50 to-blue-700/50 hover:from-blue-600/70 hover:to-blue-700/70 border border-blue-400/50 hover:border-blue-300/70 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-[1.02]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    📊 Upload Dataset
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"></div>
                </Link>
                <Link
                  href="/modules"
                  className="group relative backdrop-blur-xl bg-gradient-to-r from-purple-600/50 to-purple-700/50 hover:from-purple-600/70 hover:to-purple-700/70 border border-purple-400/50 hover:border-purple-300/70 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 overflow-hidden shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    📚 View Roadmap
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"></div>
                </Link>
                <button className="group relative backdrop-blur-xl bg-gradient-to-r from-green-600/50 to-green-700/50 hover:from-green-600/70 hover:to-green-700/70 border border-green-400/50 hover:border-green-300/70 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 overflow-hidden shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 hover:scale-[1.02]">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    🧪 New Experiment
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"></div>
                </button>
              </div>
            </div>

            {/* Roadmap Progress */}
            <div className="mb-12" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}>
              <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Bebas Neue'" }}>Your Learning Path</h2>
              <div className="space-y-6">
                {roadmaps.map((roadmap) => (
                  <div
                    key={roadmap.roadmap_id}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 shadow-2xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Bebas Neue'" }}>
                          {roadmap.title}
                        </h3>
                        <p className="text-zinc-400 mt-1">
                          {roadmap.completed_tasks}/{roadmap.total_tasks} tasks completed
                        </p>
                      </div>
                      <span className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        {roadmap.completion_percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-full h-4 overflow-hidden mb-6">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all duration-500 shadow-lg shadow-violet-500/50"
                        style={{
                          width: `${roadmap.completion_percentage}%`,
                        }}
                      />
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((month) => (
                        <button
                          key={month}
                          className="py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-[1.05]"
                          style={{ fontFamily: "'Space Mono', monospace" }}
                        >
                          Month {month}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Runs */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}>
              <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Bebas Neue'" }}>Recent Runs</h2>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center shadow-2xl">
                <p className="text-6xl mb-4">🚀</p>
                <p className="text-zinc-400 font-semibold text-lg">
                  No runs yet. Create your first experiment to get started!
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

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
        `}</style>
      </div>
    </>
  );
}
