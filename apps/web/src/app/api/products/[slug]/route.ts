import { handleRouteError, json } from "@/lib/server/http";
import { products } from "@/lib/server/catalog";
import { attachMediaMeta } from "@/lib/server/media-meta";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const row = await products.findOnePublic(slug);
    const [enriched] = await attachMediaMeta([row]);
    return json(enriched);
  } catch (err) {
    return handleRouteError(err);
  }
}
