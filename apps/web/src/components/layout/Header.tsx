"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { IconBag, IconHeart, IconSearch } from "@/components/icons";
import { categories } from "@/data/products";
import { cn } from "@/lib/format";
import { useBag } from "@/store/bag";

export function Header() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Categories");
  const pathname = usePathname();
  const { cartCount, wishlistCount } = useBag();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Transparent over home hero; solid light on cream pages; always noir while menu is open.
  const onDark = open || (isHome && !scrolled);
  const shopActive =
    pathname.startsWith("/products") || pathname.startsWith("/product");

  const primaryLinks = [
    { href: "/products" as const, label: t("products") },
  ];

  const linkMuted = onDark
    ? "text-[#f4efe8]/55 hover:text-[#f4efe8]"
    : "text-[#1c1a19]/55 hover:text-[#1c1a19]";
  const linkActive = onDark ? "text-[#f4efe8]" : "text-[#1c1a19]";
  const linkSoft = onDark
    ? "text-[#f4efe8]/45 hover:text-[#f4efe8]"
    : "text-[#1c1a19]/45 hover:text-[#1c1a19]";
  const iconBtn = onDark
    ? "text-[#f4efe8]/80 hover:text-[#f4efe8]"
    : "text-[#1c1a19]/70 hover:text-[#1c1a19]";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,color] duration-500",
        open
          ? "border-b border-white/10 bg-[#121110] text-[#f4efe8]"
          : onDark
            ? "border-b border-transparent bg-transparent text-[#f4efe8]"
            : "border-b border-[#1c1a19]/10 bg-[#f0ebe4]/95 text-[#1c1a19] backdrop-blur-xl",
      )}
    >
      <div className="container-rg grid h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center md:h-[5rem]">
        {/* Left — mobile menu / desktop nav */}
        <div className="flex items-center justify-start gap-8">
          <button
            type="button"
            className="relative z-[60] flex h-11 w-11 -ml-2 items-center justify-center lg:hidden"
            aria-label={open ? t("close") : t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative flex h-3.5 w-[18px] flex-col justify-between">
              <span
                className={cn(
                  "block h-px w-full origin-center bg-current transition duration-300",
                  open && "translate-y-[6.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-px w-full bg-current transition duration-300",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-px w-full origin-center bg-current transition duration-300",
                  open && "-translate-y-[6.5px] -rotate-45",
                )}
              />
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-8" aria-label="Primary">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative text-[11px] uppercase tracking-[0.24em] transition",
                  shopActive ? linkActive : linkMuted,
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-[#c9a08a] transition-all duration-300",
                    shopActive ? "w-full" : "w-0 group-hover:w-full",
                  )}
                />
              </Link>
            ))}

            {categories.slice(0, 4).map((c, i) => (
              <Link
                key={c}
                href={`/products?category=${c}`}
                className={cn(
                  "text-[11px] uppercase tracking-[0.2em] transition",
                  linkSoft,
                  i > 1 && "hidden xl:inline",
                )}
              >
                {tc(c)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center — brand */}
        <Link
          href="/"
          className="relative z-[60] flex items-center gap-2.5 justify-self-center"
          onClick={() => setOpen(false)}
        >
          <span className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-[#c9a08a]/35 md:h-9 md:w-9">
            <Image
              src="/brand/logo.png"
              alt="Rose Glow"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="font-display text-[1.15rem] tracking-[0.02em] md:text-xl">
            Rose Glow
          </span>
        </Link>

        {/* Right — actions */}
        <div className="relative z-[60] flex items-center justify-end gap-0.5 sm:gap-1">
          <div className="mr-3 hidden lg:block">
            <LocaleSwitcher light={onDark} />
          </div>

          <Link
            href="/search"
            className={cn(
              "flex h-11 w-11 items-center justify-center transition",
              iconBtn,
            )}
            aria-label={t("search")}
          >
            <IconSearch className="h-[17px] w-[17px]" />
          </Link>

          <Link
            href="/wishlist"
            className={cn(
              "relative hidden h-11 w-11 items-center justify-center transition md:flex",
              iconBtn,
            )}
            aria-label={t("wishlist")}
          >
            <IconHeart className="h-[17px] w-[17px]" />
            {wishlistCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center bg-[#c9a08a] px-1 text-[9px] leading-none text-[#0e0d0c]">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            ) : null}
          </Link>

          <Link
            href="/cart"
            className={cn(
              "relative flex h-11 w-11 items-center justify-center transition",
              iconBtn,
            )}
            aria-label={t("cart")}
          >
            <IconBag className="h-[17px] w-[17px]" />
            <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center bg-[#c9a08a] px-1 text-[9px] leading-none text-[#0e0d0c]">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t("close")}
          className={cn(
            "absolute inset-0 bg-[#0e0d0c]/70 transition-opacity duration-500",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />

        <div
          className={cn(
            "absolute inset-x-0 top-0 flex max-h-[100dvh] flex-col border-b border-white/10 bg-[#121110] pt-[4.25rem] text-[#f4efe8] shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out md:pt-[5rem]",
            open ? "translate-y-0" : "-translate-y-[105%]",
          )}
        >
          <div className="overflow-y-auto px-5 pb-10 pt-3 sm:px-8">
            <div className="mb-6 h-px w-10 bg-gradient-to-r from-[#c9a08a] to-transparent" />

            <nav aria-label="Mobile">
              <Link
                href="/products"
                className="flex items-center justify-between border-b border-white/10 py-4 transition"
                onClick={() => setOpen(false)}
              >
                <span
                  className={cn(
                    "font-display text-3xl tracking-[-0.02em]",
                    shopActive ? "text-[#f4efe8]" : "text-[#f4efe8]/90",
                  )}
                >
                  {t("products")}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a08a]">
                  {t("shopAll")}
                </span>
              </Link>

              <p className="mb-2 mt-8 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
                {t("categories")}
              </p>
              <ul className="flex flex-col">
                {categories.map((c) => (
                  <li key={c} className="border-b border-white/10">
                    <Link
                      href={`/products?category=${c}`}
                      className="group flex items-center justify-between py-4 text-[17px] text-[#f4efe8] transition hover:text-[#c9a08a]"
                      onClick={() => setOpen(false)}
                    >
                      <span>{tc(c)}</span>
                      <span className="text-[#c9a08a] transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Link
                href="/wishlist"
                className="border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]/75 transition hover:border-[#c9a08a]/40 hover:text-[#f4efe8]"
                onClick={() => setOpen(false)}
              >
                {t("wishlist")}
              </Link>
              <Link
                href="/cart"
                className="border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]/75 transition hover:border-[#c9a08a]/40 hover:text-[#f4efe8]"
                onClick={() => setOpen(false)}
              >
                {t("cart")}
                {cartCount > 0 ? ` · ${cartCount}` : ""}
              </Link>
            </div>

            <div className="mt-6 flex gap-4 text-[11px] uppercase tracking-[0.16em] text-[#f4efe8]/45">
              <Link href="/about" onClick={() => setOpen(false)} className="hover:text-[#f4efe8]">
                {t("about")}
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-[#f4efe8]">
                {t("contact")}
              </Link>
              <Link href="/search" onClick={() => setOpen(false)} className="hover:text-[#f4efe8]">
                {t("search")}
              </Link>
            </div>

            <div className="mt-10 flex items-end justify-between gap-4 border-t border-white/10 pt-7">
              <div>
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.22em] text-[#f4efe8]/45">
                  Language
                </p>
                <LocaleSwitcher light />
              </div>
              <p className="max-w-[9rem] text-right text-[10px] uppercase leading-5 tracking-[0.16em] text-[#f4efe8]/40">
                {t("atelierNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
