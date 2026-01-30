"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type ContinueResponse = {
  resume?: boolean;
  roadmap?: {
    id: number;
    title: string;
  };
  module?: {
    id: number;
    month_number: number;
    title: string;
  };
  task?: {
    id: number;
    type: string;
    title: string;
    content: any;
    points: number;
  };
  all_completed: boolean;
  message?: string;
};

export default function ContinueLearningPage() {
  const [data, setData] = useState<ContinueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/continue-learning");
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-6">No data</div>;
  }

  if (data.all_completed) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">🎉 All Done!</h1>
        <p>{data.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">
        {data.resume ? "Continue Learning" : "Start Next Task"}
      </h1>

      <div className="rounded border p-4 space-y-2">
        <p className="text-sm text-gray-500">Roadmap</p>
        <h2 className="text-lg font-semibold">
          {data.roadmap?.title}
        </h2>
      </div>

      <div className="rounded border p-4 space-y-2">
        <p className="text-sm text-gray-500">
          Module • Month {data.module?.month_number}
        </p>
        <h3 className="text-md font-semibold">
          {data.module?.title}
        </h3>
      </div>

      <div className="rounded border p-4 space-y-2">
        <p className="text-sm text-gray-500">
          Task • {data.task?.type}
        </p>
        <h4 className="text-md font-semibold">
          {data.task?.title}
        </h4>

        {data.task?.content && (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(data.task.content, null, 2)}
          </pre>
        )}

        <p className="text-sm text-gray-500">
          Points: {data.task?.points}
        </p>
      </div>
    </div>
  );
}
