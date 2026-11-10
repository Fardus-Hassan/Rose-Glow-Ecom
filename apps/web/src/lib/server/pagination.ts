export type PageParams = {
  page: number;
  pageSize: number;
  skip: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parsePageParams(
  searchParams: URLSearchParams,
  defaults: { pageSize?: number; maxPageSize?: number } = {},
): PageParams {
  const defaultSize = defaults.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxSize = defaults.maxPageSize ?? MAX_PAGE_SIZE;
  const rawPage = Number(searchParams.get("page") || 1);
  const rawSize = Number(searchParams.get("pageSize") || defaultSize);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize > 0
      ? Math.min(maxSize, Math.floor(rawSize))
      : defaultSize;
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function paginated<T>(
  items: T[],
  total: number,
  params: Pick<PageParams, "page" | "pageSize">,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize) || 1);
  const page = Math.min(params.page, totalPages);
  return {
    items,
    page,
    pageSize: params.pageSize,
    total,
    totalPages,
  };
}
