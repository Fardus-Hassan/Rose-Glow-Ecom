import { Role } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { products } from "@/lib/server/catalog";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await context.params;
    return json(await products.findOneAdmin(id));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { id } = await context.params;
    const body = await readJson<Record<string, unknown>>(request);
    return json(await products.update(id, body));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { id } = await context.params;
    return json(await products.remove(id));
  } catch (err) {
    return handleRouteError(err);
  }
}
