import { Role } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { getSection, upsertSection } from "@/lib/server/cms";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    await requireUser(request);
    const { key } = await context.params;
    return json(await getSection(key));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { key } = await context.params;
    const body = await readJson<{
      data: Record<string, unknown>;
      seo?: Record<string, unknown> | null;
    }>(request);
    return json(await upsertSection(key, body.data ?? {}, body.seo));
  } catch (err) {
    return handleRouteError(err);
  }
}
