import type { Definition } from "./types";

const BASE_URL = "http://localhost:3004/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getDefinition(
  word: string,
  context: string
): Promise<Definition> {
  const data = await request<{ success: boolean; definition: Definition }>(
    "/define",
    {
      method: "POST",
      body: JSON.stringify({ word, context }),
    }
  );
  return data.definition;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await request<{ status: string }>("/health");
    return true;
  } catch {
    return false;
  }
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    return "Rate limit exceeded. Please wait before making more requests.";
  }
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    return error.message;
  }
  return "An unexpected error occurred";
}
