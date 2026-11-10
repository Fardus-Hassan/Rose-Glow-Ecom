import clsx from "clsx";
import type { OrderStatus } from "@/lib/admin/constants";

const styles: Record<OrderStatus, string> = {
  PENDING: "border-amber-700/30 bg-amber-50 text-amber-900",
  CONFIRMED: "border-sky-800/25 bg-sky-50 text-sky-950",
  PROCESSING: "border-violet-800/25 bg-violet-50 text-violet-950",
  SHIPPED: "border-indigo-800/25 bg-indigo-50 text-indigo-950",
  DELIVERED: "border-emerald-800/25 bg-emerald-50 text-emerald-950",
  CANCELLED: "border-ink/20 bg-ink/5 text-muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
