import { handleRouteError, json } from "@/lib/server/http";
import { content } from "@/lib/server/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    return json(await content.getPage(slug));
  } catch (err) {
    return handleRouteError(err);
  }
}
