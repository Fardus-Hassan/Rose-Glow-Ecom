export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const ADMIN_PAGE_SIZE = {
  products: 20,
  orders: 20,
  messages: 20,
  reviews: 20,
  subscribers: 25,
  media: 12,
} as const;

export function pageQuery(
  page: number,
  pageSize: number,
  extra?: Record<string, string | undefined | null>,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value != null && value !== "") params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
