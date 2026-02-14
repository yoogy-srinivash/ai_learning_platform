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
  let mounted = true;

  async function fetchDashboard() {
    try {
      const result = await apiFetch<DashboardData>("/dashboard");

      if (mounted) {
        setData(result);
      }
    } catch (err: any) {
      if (mounted) {
        setError(err.message);
        setLoading(false); // ✅ important

        if (err.message.includes("401")) {
          router.push("/login");
        }
      }
      return;
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  fetchDashboard();

  return () => {
    mounted = false;
  };
}, []); // ✅ remove router from deps


  if (loading) return <div className="p-8 text-gray-900">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-900">No data found</div>;

  const { user, summary, roadmaps } = data;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 text-lg">Keep up the momentum! Track your learning progress here.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Overall Progress
                    </p>
                    <p className="text-4xl font-bold text-violet-600 mt-2">
                      {summary.overall_completion_percentage}%
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-fuchsia-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Tasks Completed
                    </p>
                    <p className="text-4xl font-bold text-fuchsia-600 mt-2">
                      {summary.completed_tasks}/{summary.total_tasks}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Total Modules
                    </p>
                    <p className="text-4xl font-bold text-green-600 mt-2">
                      {summary.total_modules}
                    </p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                      Roadmaps
                    </p>
                    <p className="text-4xl font-bold text-orange-600 mt-2">
                      {summary.total_roadmaps}
                    </p>
                  </div>
                  <div className="text-4xl">🗺️</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/datasets"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    📊 Upload Dataset
                  </span>
                </Link>
                <Link
                  href="/modules"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    📚 View Roadmap
                  </span>
                </Link>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl">
                  <span className="flex items-center justify-center gap-2">
                    🧪 New Experiment
                  </span>
                </button>
              </div>
            </div>

            {/* Roadmap Progress */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Learning Path</h2>
              <div className="space-y-6">
                {roadmaps.map((roadmap) => (
                  <div
                    key={roadmap.roadmap_id}
                    className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-violet-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {roadmap.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {roadmap.completed_tasks}/{roadmap.total_tasks} tasks completed
                        </p>
                      </div>
                      <span className="text-4xl font-bold text-violet-600">
                        {roadmap.completion_percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-6">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all duration-500"
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
                          className="py-3 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-violet-400 text-gray-900 font-semibold rounded-lg transition-all duration-300"
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
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Runs</h2>
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <p className="text-6xl mb-4">🚀</p>
                <p className="text-gray-600 font-semibold text-lg">
                  No runs yet. Create your first experiment to get started!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}