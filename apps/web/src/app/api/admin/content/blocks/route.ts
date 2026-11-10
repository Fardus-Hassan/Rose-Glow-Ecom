import { handleRouteError, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { content } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    return json(await content.listBlocks(searchParams.get("group") || undefined));
  } catch (err) {
    return handleRouteError(err);
  }
}
