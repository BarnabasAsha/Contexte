import type { Definition } from "./types";

const BASE_URL = process.env.API_BASE_URL;

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
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "You've made too many requests. Please wait a moment and try again.";
    }
    if (error.status >= 500) {
      return "We couldn't look up this word for you right now. Please try again shortly.";
    }
    if (error.status === 400) {
      return "We couldn't process that text. Try selecting a single word or shorter phrase.";
    }
  }
  if (error instanceof Error && error.message.includes("Failed to fetch")) {
    return "Couldn't reach the server. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again in a moment.";
}
