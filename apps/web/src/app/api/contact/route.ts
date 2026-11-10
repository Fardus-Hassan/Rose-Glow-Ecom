import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { ensureCmsSeed } from "@/lib/server/cms";

export async function POST(request: Request) {
  try {
    await ensureCmsSeed();
    const body = await readJson<{
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    }>(request);

    if (!body.name?.trim() || !body.message?.trim()) {
      throw new HttpError(400, "Name and message are required");
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: body.name.trim(),
        email: (body.email || "no-email@local").trim(),
        phone: body.phone?.trim() || null,
        subject: body.subject?.trim() || null,
        message: body.message.trim(),
        status: "NEW",
      },
    });

    return json({ id: created.id, ok: true }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
