import { Role } from "@prisma/client";
import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await context.params;
    const message = await prisma.contactMessage.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
    if (!message) throw new HttpError(404, "Message not found");
    if (!message.read) {
      await prisma.contactMessage.update({
        where: { id },
        data: { read: true },
      });
      message.read = true;
    }
    return json(message);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request);
    const { id } = await context.params;
    const body = await readJson<{
      read?: boolean;
      status?: string;
      notes?: string;
    }>(request);
    return json(
      await prisma.contactMessage.update({
        where: { id },
        data: {
          ...(typeof body.read === "boolean" ? { read: body.read } : {}),
          ...(body.status ? { status: body.status } : {}),
          ...(typeof body.notes === "string" ? { notes: body.notes } : {}),
        },
        include: { replies: true },
      }),
    );
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
    await prisma.contactMessage.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
