"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { useCatalog } from "@/store/catalog";
import { mediaUrl } from "@/lib/media";
import { Parallax } from "@/components/motion/Parallax";

export function FooterClient() {
  const t = useTranslations("Footer");
  const home = useTranslations("Home");
  const nav = useTranslations("Nav");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const { ready, categories, social, storeName, taglineEn, taglineBn, logo } =
    useCatalog();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const year = 2026;
  const tagline =
    locale === "bn"
      ? taglineBn || t("tagline")
      : taglineEn || t("tagline");
  const displayName = storeName || "Rose Glow";

  return (
    <footer className="relative overflow-hidden border-t border-[color:var(--rg-line)] bg-[color:var(--rg-paper)] text-[color:var(--rg-ink)]">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />

      <Parallax
        speed={50}
        className="pointer-events-none absolute inset-x-0 top-8 text-center"
      >
        <p className="rg-giant-type opacity-[0.05]">{displayName}</p>
      </Parallax>

      <div className="container-rg relative pt-16 md:pt-20">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="relative mb-4 h-12 w-12 overflow-hidden rounded-full ring-1 ring-[color:var(--rg-line)]">
            <Image
              src={mediaUrl(logo || "/brand/logo.png")}
              alt={displayName}
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <p className="font-brand text-3xl md:text-4xl">
            {displayName}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white">
            {!ready ? (
              <span className="inline-block h-3 w-48 animate-pulse rounded-sm bg-[color:var(--rg-soft)]" />
            ) : (
              tagline
            )}
          </p>
        </div>

        <div className="grid gap-10 border-t border-[color:var(--rg-line)] py-12 md:grid-cols-4 md:gap-8">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-charcoal)]">
              {t("follow")}
            </p>
            <SocialLinks tone="light" links={social} />
          </div>

          {/* Mobile: Navigate left + Categories right; md+: separate grid cells */}
          <div className="grid grid-cols-2 gap-8 md:contents">
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-charcoal)]">
                {t("quickLinks")}
              </p>
              <div className="flex flex-col gap-2.5 font-display text-base text-[color:var(--rg-charcoal)]/75">
                <Link href="/" className="hover:text-[color:var(--rg-charcoal)]">
                  {nav("home")}
                </Link>
                <Link href="/products" className="hover:text-[color:var(--rg-charcoal)]">
                  {nav("products")}
                </Link>
                <Link href="/about" className="hover:text-[color:var(--rg-charcoal)]">
                  {nav("about")}
                </Link>
                <Link href="/contact" className="hover:text-[color:var(--rg-charcoal)]">
                  {nav("contact")}
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-charcoal)]">
                {t("categories")}
              </p>
              <div className="flex flex-col gap-2.5 font-display text-base text-[color:var(--rg-charcoal)]/75">
                {!ready
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        className="inline-block h-3 w-20 animate-pulse rounded-sm bg-[color:var(--rg-soft)]"
                      />
                    ))
                  : categories.slice(0, 4).map((c) => (
                      <Link
                        key={c}
                        href={`/products?category=${c}`}
                        className="hover:text-[color:var(--rg-charcoal)]"
                      >
                        {tc(c)}
                      </Link>
                    ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-charcoal)]">
              {t("newsletter")}
            </p>
            <p className="mb-4 text-sm leading-6 text-[color:var(--rg-muted)]">
              {home("newsletterSub")}
            </p>
            {joined ? (
              <p className="text-sm text-[color:var(--rg-accent)]">
                {home("newsletterSuccess")}
              </p>
            ) : (
              <form
                className="flex flex-row gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!email.trim()) return;
                  setJoining(true);
                  try {
                    const res = await fetch("/api/subscribers", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                    if (!res.ok) throw new Error("Failed");
                    setJoined(true);
                    setEmail("");
                  } catch {
                    /* keep form */
                  } finally {
                    setJoining(false);
                  }
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={home("newsletterPlaceholder")}
                  className="min-h-11 flex-1 border border-[color:var(--rg-line)] bg-white px-4 text-sm outline-none placeholder:text-[color:var(--rg-muted)] focus:border-[color:var(--rg-charcoal)]"
                  required
                />
                <button
                  type="submit"
                  disabled={joining}
                  className="rg-cta-solid min-h-11 px-4 disabled:opacity-50"
                >
                  {home("newsletterCta")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--rg-line)]">
        <div className="container-rg py-5 text-center text-[11px] tracking-[0.12em] text-[color:var(--rg-muted)]">
          {t("rights", { year })}
        </div>
      </div>
    </footer>
  );
}
