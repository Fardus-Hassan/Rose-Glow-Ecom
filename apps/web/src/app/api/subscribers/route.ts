import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ email?: string }>(request);
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, "Valid email required");
    }
    const row = await prisma.subscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    return json({ id: row.id, ok: true }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
