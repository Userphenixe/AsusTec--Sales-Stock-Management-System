export const API = {
  commercial: "http://localhost:8081",
  stock: "http://localhost:8082",
  vente: "http://localhost:8083",
};

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function clearToken() {
  localStorage.removeItem("access_token");
}

/**
 * fetch wrapper that:
 * - injects Authorization: Bearer <token> if present
 * - throws an Error with .status on non-2xx
 * - returns JSON by default
 */
export async function apiFetch<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");

  // Inject JWT if exists
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Set content-type for JSON payloads if body exists and no content-type set
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || `${res.status} ${res.statusText}`);
    err.status = res.status;
    err.url = url;
    throw err;
  }

  // No content
  if (res.status === 204) return null as any;

  // Try JSON; fallback to text
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as any as T;
}
