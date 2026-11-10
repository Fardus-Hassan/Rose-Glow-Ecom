import { handleRouteError, json, readJson } from "@/lib/server/http";
import { orders } from "@/lib/server/catalog";

export async function POST(request: Request) {
  try {
    const body = await readJson<Parameters<typeof orders.create>[0]>(request);
    return json(await orders.create(body), 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
