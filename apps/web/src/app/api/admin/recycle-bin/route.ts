import { Role } from "@prisma/client";
import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import {
  destroyTrashItem,
  listTrash,
  purgeExpiredTrash,
  restoreTrashItem,
  TRASH_RETENTION_DAYS,
  type TrashKind,
  trashCount,
} from "@/lib/server/recycle-bin";

const KINDS = new Set<TrashKind>([
  "product",
  "category",
  "review",
  "subscriber",
]);

function parseKind(value: unknown): TrashKind {
  if (typeof value !== "string" || !KINDS.has(value as TrashKind)) {
    throw new HttpError(400, "Invalid trash kind");
  }
  return value as TrashKind;
}

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const items = await listTrash();
    return json({
      items,
      total: items.length,
      retentionDays: TRASH_RETENTION_DAYS,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

/** Restore or purge-expired */
export async function POST(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const body = await readJson<{
      action?: string;
      kind?: string;
      id?: string;
    }>(request);

    if (body.action === "purge-expired") {
      const purged = await purgeExpiredTrash();
      return json({ ok: true, purged, total: await trashCount() });
    }

    if (body.action === "restore") {
      const kind = parseKind(body.kind);
      if (!body.id) throw new HttpError(400, "Missing id");
      await restoreTrashItem(kind, body.id);
      return json({ ok: true });
    }

    throw new HttpError(400, "Unknown action");
  } catch (err) {
    return handleRouteError(err);
  }
}

/** Permanently delete one trash item */
export async function DELETE(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { searchParams } = new URL(request.url);
    const kind = parseKind(searchParams.get("kind"));
    const id = searchParams.get("id");
    if (!id) throw new HttpError(400, "Missing id");
    await destroyTrashItem(kind, id);
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
