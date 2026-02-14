"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Run = {
  id: number;
  status: string;
  started_at: string;
  ended_at: string;
  metrics: any;
};

export default function RunDetailsPage() {
  const params = useParams();
  const runId = params.runId as string;

  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRun() {
      try {
        const data = await apiFetch(`/experiments/runs/${runId}`);
        setRun(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRun();
  }, [runId]);

  if (loading) return <p>Loading run...</p>;
  if (!run) return <p>Run not found</p>;

  const metrics = run.metrics || {};

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Run #{run.id}</h1>

      <div className="space-y-2">
        <p>Status: <span className="font-semibold">{run.status}</span></p>
        <p>Started: {run.started_at}</p>
        <p>Ended: {run.ended_at}</p>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(metrics)
          .filter(([key]) => key !== "confusion_matrix")
          .map(([key, value]) => (
            <div
              key={key}
              className="p-4 border rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-500">{key}</p>
              <p className="text-xl font-semibold">{String(value)}</p>
            </div>
          ))}
      </div>

      {/* Confusion Matrix */}
      {metrics.confusion_matrix && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Confusion Matrix
          </h2>

          <div className="inline-block border">
            {metrics.confusion_matrix.map(
              (row: number[], rowIndex: number) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell: number, colIndex: number) => (
                    <div
                      key={colIndex}
                      className="w-16 h-16 flex items-center justify-center border"
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
