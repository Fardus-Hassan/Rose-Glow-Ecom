import { Role } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { seo } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    return json(await seo.list());
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const body = await readJson<Parameters<typeof seo.upsert>[0]>(request);
    return json(await seo.upsert(body));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "/";
    return json(await seo.remove(path.startsWith("/") ? path : `/${path}`));
  } catch (err) {
    return handleRouteError(err);
  }
}
