import { handleRouteError, json } from "@/lib/server/http";
import { content } from "@/lib/server/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await context.params;
    return json(await content.getBlock(key));
  } catch (err) {
    return handleRouteError(err);
  }
}
