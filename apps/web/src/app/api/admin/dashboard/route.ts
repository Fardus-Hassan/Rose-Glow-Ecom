import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { dashboardOverview } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    return json(await dashboardOverview());
  } catch (err) {
    return handleRouteError(err);
  }
}
