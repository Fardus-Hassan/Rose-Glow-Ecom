import { Role } from "@prisma/client";
import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { paginated, parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const exportAll = searchParams.get("export") === "1";
    const where = { deletedAt: null };

    if (exportAll) {
      const rows = await prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return json({
        items: rows,
        page: 1,
        pageSize: rows.length || 1,
        total: rows.length,
        totalPages: 1,
      });
    }

    const pageParams = parsePageParams(searchParams, { pageSize: 25 });
    const [total, items] = await Promise.all([
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pageParams.skip,
        take: pageParams.pageSize,
      }),
    ]);
    return json(paginated(items, total, pageParams));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const body = await readJson<{ id?: string }>(request);
    if (!body.id) throw new HttpError(400, "Missing id");
    const row = await prisma.subscriber.findFirst({
      where: { id: body.id, deletedAt: null },
    });
    if (!row) throw new HttpError(404, "Subscriber not found");
    await prisma.subscriber.update({
      where: { id: body.id },
      data: { deletedAt: new Date() },
    });
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
