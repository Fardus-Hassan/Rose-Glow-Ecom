import { handleRouteError, json } from "@/lib/server/http";
import { products } from "@/lib/server/catalog";
import { attachMediaMeta } from "@/lib/server/media-meta";
import { parseLandingConfig } from "@/lib/landing";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const row = await products.findLandingPublic(slug);
    const [withMeta] = await attachMediaMeta([row]);
    return json({
      ...withMeta,
      landing: parseLandingConfig(row.landing),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
