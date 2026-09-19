import type { AuthUser } from "./types";

const TOKEN_KEY = "matiks_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiError = { message: string };

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
  });
  const body = (await res.json().catch(() => ({}))) as ApiError & T;

  if (!res.ok) {
    throw new Error(
      typeof body.message === "string" ? body.message : "Request failed",
    );
  }

  return body;
}

export async function register(email: string, password: string) {
  return request<{ message: string }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return request<{ message: string; data: { token: string } }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
}

export async function fetchMe() {
  return request<{ message: string; data: { user: AuthUser } }>(
    "/api/v1/auth/me",
  );
}
