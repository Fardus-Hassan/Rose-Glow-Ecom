function resolveApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return `${site || "http://localhost:3001"}/api`;
}

export function getApiBase() {
  return resolveApiBase();
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  try {
    const response = await fetch(`${getApiBase()}${normalized}`, {
      ...init,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
