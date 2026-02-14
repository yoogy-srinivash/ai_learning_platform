"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Dataset = {
  id: number;
  name: string;
  rows: number;
  cols: number;
};

const ALGORITHMS: Record<string, string[]> = {
  classification: ["logistic_regression"],
  regression: ["linear_regression"],
  clustering: ["kmeans"],
};

export default function NewExperimentPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [taskType, setTaskType] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [testSize, setTestSize] = useState(0.2);
  const [nClusters, setNClusters] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Load datasets
  useEffect(() => {
    async function fetchDatasets() {
      try {
        const res = await apiFetch("/datasets");
        setDatasets(res);
      } catch (err: any) {
        setError("Failed to load datasets");
      }
    }

    fetchDatasets();
  }, []);

  const availableAlgorithms = taskType
    ? ALGORITHMS[taskType] || []
    : [];

  async function handleCreateExperiment() {
    if (!selectedDataset || !taskType || !algorithm) return;

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Create experiment
      const experiment = await apiFetch("/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: `Experiment - ${taskType}`,
          dataset_id: selectedDataset,
          experiment_type: "ml",
          config: {
            task_type: taskType,
            algorithm: algorithm,
            test_size: testSize,
            n_clusters: nClusters,
          },
        }),
      });

      // 2️⃣ Run experiment immediately
      await apiFetch(`/experiments/${experiment.id}/runs`, {
        method: "POST",
      });

      // 3️⃣ Redirect
      router.push(`/experiments/${experiment.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create experiment");
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    selectedDataset !== null &&
    taskType !== "" &&
    algorithm !== "";

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Experiment</h1>

      {/* Dataset Selection */}
      <div className="space-y-2">
        <label className="font-medium">Select Dataset</label>
        <select
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setSelectedDataset(Number(e.target.value))
          }
        >
          <option value="">Select dataset</option>
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.rows} rows × {d.cols} cols)
            </option>
          ))}
        </select>
      </div>

      {/* Task Type */}
      <div className="space-y-2">
        <label className="font-medium">Task Type</label>
        <select
          className="w-full border p-2 rounded"
          value={taskType}
          onChange={(e) => {
            setTaskType(e.target.value);
            setAlgorithm(""); // reset algorithm
          }}
        >
          <option value="">Select task type</option>
          <option value="classification">Classification</option>
          <option value="regression">Regression</option>
          <option value="clustering">Clustering</option>
        </select>
      </div>

      {/* Algorithm */}
      {taskType && (
        <div className="space-y-2">
          <label className="font-medium">Algorithm</label>
          <select
            className="w-full border p-2 rounded"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="">Select algorithm</option>
            {availableAlgorithms.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Parameters */}
      {(taskType === "classification" ||
        taskType === "regression") && (
        <div className="space-y-2">
          <label className="font-medium">
            Test Size (0.1 – 0.5)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="0.5"
            value={testSize}
            onChange={(e) =>
              setTestSize(Number(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {taskType === "clustering" && (
        <div className="space-y-2">
          <label className="font-medium">
            Number of Clusters
          </label>
          <input
            type="number"
            min="2"
            value={nClusters}
            onChange={(e) =>
              setNClusters(Number(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleCreateExperiment}
        disabled={!isValid || loading}
        className={`px-6 py-2 rounded text-black ${
          isValid
            ? "bg-black hover:bg-gray-800"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Creating..." : "Create & Run"}
      </button>

      {error && (
        <p className="text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
