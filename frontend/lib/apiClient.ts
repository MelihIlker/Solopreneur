import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;

// Fetch CSRF token before each request
async function getCsrfToken(sessionId: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl}api/csrf-token`, {
      method: "GET",
      credentials: "include", // Include cookies
      headers: {
        "X-Session-ID": sessionId,
      },
    });
    const { csrfToken } = await res.json();
    return csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw new Error("Failed to fetch CSRF token");
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  const cookie = await cookies();
  const sessionId = cookie.get("access_token")?.value;
  
  // Allow /api/auth/* endpoints without session (login, register)
  const isAuthEndpoint = endpoint.startsWith("api/auth/");
  
  if (!sessionId && !isAuthEndpoint) {
    throw new Error("No active session. Please login first.");
  }

  // Only get CSRF token if we have a session
  let csrfToken = "";
  if (sessionId) {
    csrfToken = await getCsrfToken(sessionId);
  }

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(sessionId && { "X-Session-ID": sessionId }),
      ...(csrfToken && { "X-CSRF-Token": csrfToken }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  let data: T;
  try {
    data = await response.json();
  } catch (jsonError) {
    data = null as T;
  }

  if (!response.ok) {
    throw new Error(
      (data as any)?.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}
