export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  const url = `${baseUrl}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
