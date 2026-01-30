"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import { Dataset } from "@/lib/types";

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  async function fetchDatasets() {
    try {
      const data = await apiFetch<Dataset[]>("/datasets");
      setDatasets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          } as HeadersInit,
          body: formData,
        }
      );

      // Fix the endpoint
      const correctRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/datasets/upload`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          } as HeadersInit,
          body: formData,
        }
      );

      if (!correctRes.ok) {
        const errorData = await correctRes.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const newDataset = await correctRes.json();
      setDatasets([newDataset, ...datasets]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(datasetId: number) {
    if (
      !window.confirm(
        "Are you sure you want to delete this dataset? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/datasets/${datasetId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          } as HeadersInit,
        }
      );

      setDatasets(datasets.filter((d) => d.id !== datasetId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleFileUpload(file);
      } else {
        setError("Please drop a CSV file");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dataset Hub 📊
            </h1>
            <p className="text-gray-600">
              Upload CSV files to get started with your ML experiments
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-12">
            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                disabled={uploading}
                className="hidden"
              />
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uploading ? "Uploading..." : "Drag & drop your CSV here"}
              </h3>
              <p className="text-gray-600 mb-4">
                or click to select a file from your computer
              </p>
              <p className="text-sm text-gray-500">
                CSV files only • Max size: 100MB
              </p>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Datasets List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Datasets ({datasets.length})
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading datasets...</p>
              </div>
            ) : datasets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-5xl mb-4">🚀</p>
                <p className="text-gray-600 font-medium">
                  No datasets yet. Upload your first CSV to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">📄</div>
                      <button
                        onClick={() => handleDelete(dataset.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 truncate">
                      {dataset.name}
                    </h3>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Rows:</span>
                        <span className="font-semibold text-gray-900">
                          {dataset.rows}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Columns:</span>
                        <span className="font-semibold text-gray-900">
                          {dataset.cols}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Created:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(dataset.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                      Use in Experiment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
