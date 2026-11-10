import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { listSections } from "@/lib/server/cms";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    return json(await listSections());
  } catch (err) {
    return handleRouteError(err);
  }
}
