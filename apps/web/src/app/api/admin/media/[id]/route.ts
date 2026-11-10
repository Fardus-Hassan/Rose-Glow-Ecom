import { unlink } from "node:fs/promises";
import path from "node:path";
import { Role } from "@prisma/client";
import { handleRouteError, json, HttpError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { deleteFromR2, isR2Url } from "@/lib/server/r2";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { id } = await context.params;
    const body = (await request.json()) as { alt?: string };
    const row = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(typeof body.alt === "string" ? { alt: body.alt } : {}),
      },
    });
    return json(row);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireUser(_request, [Role.ADMIN]);
    const { id } = await context.params;
    const row = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, "Media not found");

    await prisma.mediaAsset.delete({ where: { id } });

    if (isR2Url(row.url)) {
      const variants = (row.variants as Record<string, string> | null) ?? {};
      const keys = new Set<string>([
        row.url,
        ...Object.values(variants).filter(Boolean),
      ]);
      await Promise.all(
        [...keys].map((url) => deleteFromR2(url).catch(() => undefined)),
      );
    } else if (row.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", row.url);
      await unlink(filePath).catch(() => undefined);
    }

    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
