import { cn } from "@/lib/format";

/** Old price with a thin diagonal cut, so Bangla digits stay readable. */
export function StruckPrice({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block px-0.5 pb-0.5 font-sans text-[1.2rem] font-semibold leading-none text-white",
        className,
      )}
    >
      {children}
      <svg
        aria-hidden
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-[18%] h-[70%] w-full"
      >
        <line
          x1="0"
          y1="7"
          x2="100"
          y2="17"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="1.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
