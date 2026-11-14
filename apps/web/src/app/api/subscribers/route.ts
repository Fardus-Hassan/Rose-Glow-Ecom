import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ email?: string }>(request);
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, "Valid email required");
    }

    const existing = await prisma.subscriber.findFirst({
      where: { email, deletedAt: null },
    });
    if (existing) {
      return json({ id: existing.id, ok: true }, 200);
    }

    const trashed = await prisma.subscriber.findFirst({
      where: { email, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
    if (trashed) {
      const restored = await prisma.subscriber.update({
        where: { id: trashed.id },
        data: { deletedAt: null },
      });
      return json({ id: restored.id, ok: true }, 201);
    }

    const row = await prisma.subscriber.create({ data: { email } });
    return json({ id: row.id, ok: true }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
