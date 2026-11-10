import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { paginated, parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const exportAll = searchParams.get("export") === "1";

    if (exportAll) {
      const rows = await prisma.subscriber.findMany({
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
      prisma.subscriber.count(),
      prisma.subscriber.findMany({
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
