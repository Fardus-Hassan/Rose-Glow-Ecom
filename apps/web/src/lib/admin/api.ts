const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rg_admin_token");
}

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE.replace(/\/$/, "")}${normalized}`;
}

export async function api<T>(
  path: string,
  init: RequestInit & { token?: string | null; auth?: boolean } = {},
): Promise<T> {
  const { token, auth = true, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (
    rest.body &&
    !(rest.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const bearer = token ?? getStoredToken();
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
  }

  const response = await fetch(buildUrl(path), { ...rest, headers });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (typeof data.message === "string") message = data.message;
      else if (Array.isArray(data.message)) message = data.message.join(", ");
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
