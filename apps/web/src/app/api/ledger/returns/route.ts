import { orders } from "@/lib/server/catalog";
import { handleRouteError, HttpError, json, readJson } from "@/lib/server/http";

function assertShopKey(header: string | null) {
  const key = process.env.LEDGER_SHOP_KEY || "";
  if (!key || header !== key) throw new HttpError(401, "Shop key is not valid");
}

export async function POST(request: Request) {
  try {
    assertShopKey(request.headers.get("x-shop-key"));
    const body = await readJson<{
      orderNumber?: string;
      shopOrderNumber?: string;
      returned?: boolean;
      items?: Array<{ sku?: string; returned?: number }>;
    }>(request);
    return json(await orders.applyLedgerReturn(body));
  } catch (err) {
    return handleRouteError(err);
  }
}
