import { cn } from "@/lib/format";
import { ensureRichHtml, sanitizeRichHtml } from "@/lib/rich-text";

export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safe = sanitizeRichHtml(ensureRichHtml(html));
  if (!safe) return null;

  return (
    <div
      className={cn("rg-prose", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
