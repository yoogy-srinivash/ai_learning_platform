"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Task = {
  id: number;
  title: string;
  type: string;
  content: any;
};

export default function LearnTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ FETCH TASK (this was missing)
  useEffect(() => {
    async function fetchTask() {
      try {
        const data = await apiFetch<Task>(`/modules/tasks/${taskId}`);
        setTask(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [taskId]);

  // Mark task as complete
  async function handleComplete() {
    setSubmitting(true);
    setError("");

    try {
      const res = await apiFetch(
        `/modules/tasks/${taskId}/complete`,
        {
          method: "POST",
        }
      );

      if (res.next_task) {
        router.push(`/learn/${res.next_task.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!task) return <p>Task not found</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{task.title}</h1>

      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(task.content, null, 2)}
      </pre>

      <button
        onClick={handleComplete}
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-black rounded"
      >
        {submitting ? "Completing..." : "Mark as Complete"}
      </button>
    </div>
  );
}
