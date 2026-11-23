import { cn } from "@/lib/format";

/**
 * Shared god-dark page intro — gold eyebrow, display title, gold rule, lead.
 */
export function EditorialPageHeader({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <header className={cn("relative max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--rg-accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
        {title}
      </h1>
      <div className="rg-home-gold-rule mt-5 w-16 md:w-20" />
      {lead ? (
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-white md:text-base md:leading-8">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
