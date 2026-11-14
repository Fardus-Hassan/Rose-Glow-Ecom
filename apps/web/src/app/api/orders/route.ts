import { handleRouteError, json, readJson } from "@/lib/server/http";
import { orders } from "@/lib/server/catalog";
import { sendMetaCapiPurchase } from "@/lib/server/meta-pixel";

export async function POST(request: Request) {
  try {
    const body = await readJson<Parameters<typeof orders.create>[0]>(request);
    const order = await orders.create(body);

    void sendMetaCapiPurchase({
      eventId: order.id,
      value: order.total,
      orderNumber: order.orderNumber,
      contents: order.items.map((item) => ({
        id: item.productSku || item.productId || item.id,
        quantity: item.quantity,
        item_price: item.unitPrice,
      })),
      customer: {
        phone: order.customerPhone,
        email: order.customerEmail || undefined,
        name: order.customerName,
      },
      eventSourceUrl: request.headers.get("referer") || undefined,
      clientIp:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return json(order, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
