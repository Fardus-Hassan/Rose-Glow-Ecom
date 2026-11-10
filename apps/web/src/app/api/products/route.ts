import { handleRouteError, json } from "@/lib/server/http";
import { products } from "@/lib/server/catalog";
import { attachMediaMeta } from "@/lib/server/media-meta";
import { parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePageParams(searchParams, {
      pageSize: 12,
      maxPageSize: 100,
    });
    const minRaw = searchParams.get("minPrice");
    const maxRaw = searchParams.get("maxPrice");
    const sortRaw = searchParams.get("sort") || "featured";
    const sort =
      sortRaw === "newest" ||
      sortRaw === "price-asc" ||
      sortRaw === "price-desc" ||
      sortRaw === "featured"
        ? sortRaw
        : "featured";

    const result = await products.findPublic({
      category: searchParams.get("category") || undefined,
      featured:
        searchParams.get("featured") === "1" ||
        searchParams.get("featured") === "true",
      q: searchParams.get("q") || undefined,
      sort,
      minPrice: minRaw != null && minRaw !== "" ? Number(minRaw) : undefined,
      maxPrice: maxRaw != null && maxRaw !== "" ? Number(maxRaw) : undefined,
      page,
    });

    return json({
      ...result,
      items: await attachMediaMeta(result.items),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
