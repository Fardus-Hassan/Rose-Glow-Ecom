import { OrderStatus } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { orders } from "@/lib/server/catalog";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await context.params;
    const body = await readJson<{ status: OrderStatus }>(request);
    return json(await orders.updateStatus(id, body.status));
  } catch (err) {
    return handleRouteError(err);
  }
}
