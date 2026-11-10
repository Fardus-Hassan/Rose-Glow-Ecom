import { handleRouteError, json } from "@/lib/server/http";
import { categories } from "@/lib/server/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active =
      searchParams.get("active") === "1" ||
      searchParams.get("active") === "true";
    return json(await categories.findAll(active));
  } catch (err) {
    return handleRouteError(err);
  }
}
