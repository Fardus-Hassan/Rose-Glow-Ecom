import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-night text-cream border border-night hover:bg-night-deep focus-visible:ring-rose/40",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-rose/50 hover:text-night focus-visible:ring-rose/30",
  ghost:
    "bg-transparent text-ink/80 border border-transparent hover:bg-ink/5 hover:text-ink",
  danger:
    "bg-transparent text-red-900 border border-red-900/25 hover:bg-red-50 focus-visible:ring-red-300",
};

export function Button({
  className,
  variant = "primary",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const { type = "button", ...rest } = props;

  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition rg-ease focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  );
}
