// lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token && !skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...(fetchOptions.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMessage = "API error";

    try {
      const error = await res.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses (204 etc.)
  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}
