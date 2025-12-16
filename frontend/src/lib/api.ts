// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  // Try to parse JSON, but don't break if it's not JSON
  let data: any = null;
  let rawText: string | null = null;

  try {
    rawText = await res.text();
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    // ✅ FIX: always throw a STRING message (avoid "Error: Object" / "{}")
    const message =
      (data && (typeof data === "string"
        ? data
        : data.error || data.message || data.code)) ||
      (typeof rawText === "string" && rawText.trim() ? rawText : null) ||
      `Request failed (${res.status} ${res.statusText})`;

    // Optional: quick debug log so you see which endpoint failed in the console
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[apiFetch] Error:", {
        path,
        status: res.status,
        payload: data ?? rawText,
      });
    }

    throw new Error(String(message));
  }

  // If there's no body, just return null
  return data;
}
