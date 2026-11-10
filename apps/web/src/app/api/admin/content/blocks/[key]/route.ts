import { Role, type Prisma } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { content } from "@/lib/server/catalog";

export async function PUT(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { key } = await context.params;
    const body = await readJson<{
      label: string;
      group?: string;
      value: Record<string, unknown>;
    }>(request);
    return json(
      await content.upsertBlock({
        key,
        label: body.label,
        group: body.group,
        value: body.value as Prisma.InputJsonValue,
      }),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
