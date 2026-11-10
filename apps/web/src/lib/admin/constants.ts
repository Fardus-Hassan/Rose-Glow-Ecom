export const TOKEN_STORAGE_KEY = "rg_admin_token";
export const USER_STORAGE_KEY = "rg_admin_user";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
