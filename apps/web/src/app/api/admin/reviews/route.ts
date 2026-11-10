import { Role, type Prisma } from "@prisma/client";
import { handleRouteError, json, readJson } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { reviews } from "@/lib/server/catalog";
import { parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    return json(
      await reviews.findAdmin(parsePageParams(searchParams, { pageSize: 20 })),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const body = await readJson<Prisma.ReviewUncheckedCreateInput>(request);
    return json(await reviews.create(body), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
