import { Role, type Prisma } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { categories } from "@/lib/server/catalog";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { id } = await context.params;
    const body = await readJson<Prisma.CategoryUpdateInput>(request);
    return json(await categories.update(id, body));
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
    return json(await categories.remove(id));
  } catch (err) {
    return handleRouteError(err);
  }
}
