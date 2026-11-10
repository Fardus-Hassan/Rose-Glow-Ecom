import { Role, type Prisma } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { categories } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    return json(await categories.findAll(false));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const body = await readJson<Prisma.CategoryCreateInput>(request);
    return json(await categories.create(body), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
