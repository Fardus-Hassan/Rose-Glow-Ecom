import { handleRouteError, json } from "@/lib/server/http";
import { reviews } from "@/lib/server/catalog";
import { parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return json(
      await reviews.findPublic({
        productId: searchParams.get("productId") || undefined,
        productSlug: searchParams.get("productSlug") || undefined,
        page: parsePageParams(searchParams, {
          pageSize: 8,
          maxPageSize: 50,
        }),
      }),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
