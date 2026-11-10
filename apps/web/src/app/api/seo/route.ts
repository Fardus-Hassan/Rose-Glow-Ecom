import { handleRouteError, json } from "@/lib/server/http";
import { seo } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "/";
    const locale = searchParams.get("locale") === "bn" ? "bn" : "en";
    return json(await seo.resolve(path, locale));
  } catch (err) {
    return handleRouteError(err);
  }
}
