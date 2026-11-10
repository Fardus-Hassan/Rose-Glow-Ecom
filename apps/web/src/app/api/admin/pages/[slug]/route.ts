import { Role, type Prisma } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { content } from "@/lib/server/catalog";

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { slug } = await context.params;
    const body = await readJson<Omit<Prisma.PageUncheckedCreateInput, "slug">>(
      request,
    );
    return json(await content.upsertPage({ slug, ...body }));
  } catch (err) {
    return handleRouteError(err);
  }
}
