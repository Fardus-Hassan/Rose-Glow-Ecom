import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { content } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    return json(await content.listSettings());
  } catch (err) {
    return handleRouteError(err);
  }
}
