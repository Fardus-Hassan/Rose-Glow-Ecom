import { handleRouteError, json, readJson } from "@/lib/server/http";
import { login } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ email?: string; password?: string }>(request);
    if (!body.email || !body.password) {
      return json({ message: "Email and password required" }, 400);
    }
    return json(await login(body.email, body.password));
  } catch (err) {
    return handleRouteError(err);
  }
}
