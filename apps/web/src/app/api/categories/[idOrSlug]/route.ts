import { handleRouteError, json } from "@/lib/server/http";
import { categories } from "@/lib/server/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ idOrSlug: string }> },
) {
  try {
    const { idOrSlug } = await context.params;
    return json(await categories.findOne(idOrSlug));
  } catch (err) {
    return handleRouteError(err);
  }
}
