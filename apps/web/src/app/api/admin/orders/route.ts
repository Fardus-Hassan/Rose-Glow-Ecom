import { OrderStatus } from "@prisma/client";
import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { orders } from "@/lib/server/catalog";
import { parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    return json(
      await orders.findAll({
        status: status || undefined,
        q: searchParams.get("q") || undefined,
        page: parsePageParams(searchParams, { pageSize: 20 }),
      }),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
