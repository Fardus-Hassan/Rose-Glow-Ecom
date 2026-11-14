/** Strip tags for SEO, cards, and empty checks. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichTextEmpty(html: string): boolean {
  return stripHtml(html).length === 0;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert legacy plain-text descriptions into simple HTML paragraphs. */
export function ensureRichHtml(value: string): string {
  if (!value) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((block) => {
      const inner = escapeHtml(block.trim()).replace(/\n/g, "<br>");
      return inner ? `<p>${inner}</p>` : "";
    })
    .filter(Boolean)
    .join("");
}

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "mark",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "hr",
  "span",
]);

function sanitizeStyle(style: string): string | null {
  const match = style.match(
    /^\s*text-align:\s*(left|center|right|justify)\s*;?\s*$/i,
  );
  return match ? `text-align: ${match[1].toLowerCase()}` : null;
}

/** Allowlist sanitizer for TipTap HTML (SSR-safe). */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  let out = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");

  out = out.replace(
    /<\/?([a-z0-9-]+)(\s[^>]*)?>/gi,
    (full, rawTag: string, rawAttrs = "") => {
      const tag = rawTag.toLowerCase();
      const closing = full.startsWith("</");
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;
      if (tag === "br" || tag === "hr") return `<${tag}>`;

      const attrs: string[] = [];
      if (tag === "a") {
        const href = rawAttrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)')/i);
        const url = (href?.[2] ?? href?.[3] ?? "").trim();
        if (/^https?:\/\//i.test(url) || url.startsWith("/")) {
          attrs.push(`href="${escapeHtml(url)}"`);
          attrs.push('rel="noopener noreferrer"');
          attrs.push('target="_blank"');
        }
      }
      if (tag === "mark" || tag === "span" || tag === "p" || /^h[2-4]$/.test(tag)) {
        const styleMatch = rawAttrs.match(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/i);
        const styleRaw = styleMatch?.[2] ?? styleMatch?.[3] ?? "";
        const safeStyle = styleRaw ? sanitizeStyle(styleRaw) : null;
        if (safeStyle) attrs.push(`style="${safeStyle}"`);
      }
      return attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
    },
  );

  return out;
}
