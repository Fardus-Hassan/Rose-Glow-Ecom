import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ensureCmsSeed } from "@/lib/server/cms";
import { paginated, parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    await ensureCmsSeed();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;
    const status = searchParams.get("status") || undefined;
    const inboxOnly = searchParams.get("inbox") === "1";
    const pageParams = parsePageParams(searchParams, { pageSize: 20 });

    const inboxKeys = inboxOnly
      ? (
          await prisma.messageStatus.findMany({
            where: { inInbox: true },
            select: { key: true },
          })
        ).map((s) => s.key)
      : undefined;

    const where = {
      ...(status ? { status } : {}),
      ...(inboxKeys ? { status: { in: inboxKeys } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { message: { contains: q, mode: "insensitive" as const } },
              { subject: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, messages, statuses, unread] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          read: true,
          notes: true,
          createdAt: true,
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: pageParams.skip,
        take: pageParams.pageSize,
      }),
      prisma.messageStatus.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);

    const page = paginated(
      messages.map(({ _count, ...m }) => ({
        ...m,
        replyCount: _count.replies,
        replies: [] as Array<{ id: string; body: string; createdAt: string }>,
      })),
      total,
      pageParams,
    );

    return json({
      ...page,
      messages: page.items,
      statuses,
      unread,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
