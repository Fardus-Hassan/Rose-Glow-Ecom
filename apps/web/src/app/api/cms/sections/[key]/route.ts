import { handleRouteError, json } from "@/lib/server/http";
import { getSection } from "@/lib/server/cms";

/** Public section read for the storefront. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await context.params;
    return json(await getSection(key));
  } catch (err) {
    return handleRouteError(err);
  }
}
