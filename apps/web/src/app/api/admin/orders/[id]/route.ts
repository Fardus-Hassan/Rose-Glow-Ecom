import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { orders } from "@/lib/server/catalog";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await context.params;
    return json(await orders.findOne(id));
  } catch (err) {
    return handleRouteError(err);
  }
}
