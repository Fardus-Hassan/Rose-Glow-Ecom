import { handleRouteError, json } from "@/lib/server/http";
import { me, requireUser } from "@/lib/server/auth";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    return json(await me(user.id));
  } catch (err) {
    return handleRouteError(err);
  }
}
