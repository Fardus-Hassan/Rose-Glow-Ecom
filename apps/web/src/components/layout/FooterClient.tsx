"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { useCatalog } from "@/store/catalog";
import { mediaUrl } from "@/lib/media";

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
    <footer className="bg-[#0e0d0c] text-[#f4efe8]">
      <div className="container-rg grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:gap-10 md:py-20">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-[#c9a08a]/40">
              <Image
                src={mediaUrl(logo || "/brand/logo.png")}
                alt={displayName}
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="font-display text-2xl">{displayName}</span>
          </div>
          <p className="max-w-xs text-sm leading-7 text-[#f4efe8]/55">
            {!ready ? (
              <span className="inline-block h-3 w-48 animate-pulse rounded-sm bg-white/10" />
            ) : (
              tagline
            )}
          </p>
          <div className="mt-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
              {t("follow")}
            </p>
            <SocialLinks tone="light" links={social} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:contents">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
              {t("quickLinks")}
            </p>
            <div className="flex flex-col gap-3 text-sm text-[#f4efe8]/70">
              <Link href="/" className="hover:text-[#f4efe8]">
                {nav("home")}
              </Link>
              <Link href="/products" className="hover:text-[#f4efe8]">
                {nav("products")}
              </Link>
              <Link href="/about" className="hover:text-[#f4efe8]">
                {nav("about")}
              </Link>
              <Link href="/contact" className="hover:text-[#f4efe8]">
                {nav("contact")}
              </Link>
              <Link href="/cart" className="hover:text-[#f4efe8]">
                {nav("cart")}
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
              {t("categories")}
            </p>
            <div className="flex flex-col gap-3 text-sm text-[#f4efe8]/70">
              {!ready
                ? Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className="inline-block h-3 w-20 animate-pulse rounded-sm bg-white/10"
                    />
                  ))
                : categories.slice(0, 4).map((c) => (
                    <Link
                      key={c}
                      href={`/products?category=${c}`}
                      className="hover:text-[#f4efe8]"
                    >
                      {tc(c)}
                    </Link>
                  ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("newsletter")}
          </p>
          <p className="mb-4 text-sm leading-6 text-[#f4efe8]/55">
            {home("newsletterSub")}
          </p>
          {joined ? (
            <p className="text-sm text-[#c9a08a]">You’re on the list.</p>
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
                  /* keep form visible */
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
                className="min-h-11 flex-1 border border-white/15 bg-transparent px-4 text-sm text-[#f4efe8] outline-none placeholder:text-[#f4efe8]/35 focus:border-[#c9a08a]"
                required
              />
              <button
                type="submit"
                disabled={joining}
                className="min-h-11 border border-[#c9a08a]/60 bg-[#c9a08a]/15 px-5 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-[#c9a08a]/25 disabled:opacity-50"
              >
                {home("newsletterCta")}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-rg py-5 text-[11px] tracking-[0.12em] text-[#f4efe8]/35">
          {t("rights", { year })}
        </div>
      </div>
    </footer>
  );
}
