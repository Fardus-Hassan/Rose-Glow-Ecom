"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { IconBag, IconSearch } from "@/components/icons";
import {
  categories,
  getCoverMedia,
  getProductBySlug,
  localize,
} from "@/data/products";
import { NAV_FEATURED_PRODUCT_SLUG } from "@/data/nav";
import { SmoothCollapse } from "@/components/ui/SmoothCollapse";
import { formatBdt, cn } from "@/lib/format";
import { useBag } from "@/store/bag";

type RgLenis = { stop: () => void; start: () => void };

function getLenis() {
  return (window as Window & { __rgLenis?: RgLenis }).__rgLenis;
}

export function Header() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const pathname = usePathname();
  const { cartCount, wishlistCount } = useBag();
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHome = pathname === "/";
  const featured = getProductBySlug(NAV_FEATURED_PRODUCT_SLUG);
  const featuredCover = featured ? getCoverMedia(featured) : null;

  useEffect(() => {
    setOpen(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open || shopOpen) {
      document.body.style.overflow = "hidden";
      getLenis()?.stop();
    } else {
      document.body.style.overflow = prev || "";
      getLenis()?.start();
    }
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [open, shopOpen]);

  useEffect(() => {
    if (!open && !shopOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setShopOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shopOpen]);

  useEffect(() => {
    if (!shopOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!shopRef.current?.contains(e.target as Node)) setShopOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [shopOpen]);

  const openShop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  };

  const scheduleCloseShop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShopOpen(false), 140);
  };

  const headerDark = open || shopOpen || (isHome && !scrolled);
  const shopActive =
    pathname.startsWith("/products") || pathname.startsWith("/product");
  const contactActive = pathname.startsWith("/contact");
  const aboutActive = pathname.startsWith("/about");

  const linkMuted = headerDark
    ? "text-[#f4efe8]/55 hover:text-[#f4efe8]"
    : "text-[#1c1a19]/55 hover:text-[#1c1a19]";
  const linkActive = headerDark ? "text-[#f4efe8]" : "text-[#1c1a19]";
  const iconBtn = headerDark
    ? "text-[#f4efe8]/80 hover:text-[#f4efe8]"
    : "text-[#1c1a19]/70 hover:text-[#1c1a19]";

  return (
    <header
      ref={shopRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,color] duration-500",
        open || shopOpen
          ? "border-b border-white/10 bg-[#121110] text-[#f4efe8]"
          : headerDark
            ? "border-b border-transparent bg-transparent text-[#f4efe8]"
            : "border-b border-[#1c1a19]/10 bg-[#f0ebe4]/95 text-[#1c1a19] backdrop-blur-xl",
      )}
    >
      <div className="container-rg relative grid h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center md:h-[5rem]">
        <div className="relative z-[60] flex min-w-0 items-center justify-start gap-8">
          <button
            type="button"
            className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11 lg:hidden"
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

          <nav
            className="hidden items-center gap-7 lg:flex xl:gap-8"
            aria-label="Primary"
            onMouseLeave={scheduleCloseShop}
          >
            <Link
              href="/"
              className={cn(
                "group relative text-[11px] uppercase tracking-[0.24em] transition",
                isHome && !shopActive ? linkActive : linkMuted,
              )}
              onMouseEnter={scheduleCloseShop}
            >
              {t("home")}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px bg-[#c9a08a] transition-all duration-300",
                  isHome && !shopOpen ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </Link>

            <button
              type="button"
              className={cn(
                "group relative flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] transition",
                shopActive || shopOpen ? linkActive : linkMuted,
              )}
              aria-expanded={shopOpen}
              aria-haspopup="true"
              onMouseEnter={openShop}
              onFocus={openShop}
              onClick={() => setShopOpen((v) => !v)}
            >
              {t("products")}
              <span
                className={cn(
                  "text-[9px] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  shopOpen && "rotate-180",
                )}
              >
                ▾
              </span>
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px bg-[#c9a08a] transition-all duration-300",
                  shopActive || shopOpen ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </button>

            <Link
              href="/about"
              className={cn(
                "group relative text-[11px] uppercase tracking-[0.24em] transition",
                aboutActive ? linkActive : linkMuted,
              )}
              onMouseEnter={scheduleCloseShop}
            >
              {t("about")}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px bg-[#c9a08a] transition-all duration-300",
                  aboutActive ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </Link>

            <Link
              href="/contact"
              className={cn(
                "group relative text-[11px] uppercase tracking-[0.24em] transition",
                contactActive ? linkActive : linkMuted,
              )}
              onMouseEnter={scheduleCloseShop}
            >
              {t("contact")}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px bg-[#c9a08a] transition-all duration-300",
                  contactActive ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </Link>
          </nav>
        </div>

        {/* True optical center — brand mark + name always visible */}
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 z-[55] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[#c9a08a]/35 md:h-9 md:w-9">
            <Image
              src="/brand/logo.png"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="font-display text-[1.15rem] leading-none tracking-[0.01em] md:text-xl">
            Rose Glow
          </span>
        </Link>

        {/* Spacer for grid balance */}
        <div
          className="pointer-events-none invisible flex items-center gap-2.5"
          aria-hidden
        >
          <span className="h-8 w-8 md:h-9 md:w-9" />
          <span className="font-display text-[1.15rem] md:text-xl">
            Rose Glow
          </span>
        </div>

        <div className="relative z-[60] flex items-center justify-end gap-0.5">
          <div className="mr-2 hidden lg:mr-3 lg:block">
            <LocaleSwitcher light={headerDark} />
          </div>

          <Link
            href="/search"
            className={cn(
              "group flex h-11 w-11 items-center justify-center transition",
              iconBtn,
            )}
            aria-label={t("search")}
          >
            <IconSearch className="h-[18px] w-[18px] transition duration-300 group-hover:scale-[1.06]" />
          </Link>

          <Link
            href="/cart"
            className={cn(
              "group relative flex h-11 w-11 items-center justify-center transition",
              iconBtn,
            )}
            aria-label={t("cart")}
          >
            <IconBag className="h-[18px] w-[18px] transition duration-300 group-hover:scale-[1.06]" />
            <span
              className={cn(
                "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium leading-none ring-2",
                headerDark
                  ? "bg-[#c9a08a] text-[#0e0d0c] ring-[#121110]"
                  : "bg-[#c9a08a] text-[#0e0d0c] ring-[#f0ebe4]",
              )}
            >
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Desktop full-width mega menu */}
      <div
        className={cn(
          "absolute inset-x-0 top-full hidden origin-top transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
          shopOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
        onMouseEnter={openShop}
        onMouseLeave={scheduleCloseShop}
      >
        <div className="border-b border-white/10 bg-[#121110] text-[#f4efe8] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
          <div className="container-rg grid grid-cols-[1fr_minmax(14rem,0.72fr)] gap-0">
            <div className="border-r border-white/10 py-8 pr-10">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
                {t("categories")}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-x-10 gap-y-1">
                {categories.map((c) => (
                  <li key={c}>
                    <Link
                      href={`/products?category=${c}`}
                      className="group flex items-center justify-between py-3 text-[14px] text-[#f4efe8]/8 transition hover:text-[#f4efe8]"
                      onClick={() => setShopOpen(false)}
                    >
                      <span>{tc(c)}</span>
                      <span className="translate-x-0 text-[#c9a08a] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="mt-7 inline-flex text-[10px] uppercase tracking-[0.2em] text-[#c9a08a] transition hover:text-[#f4efe8]"
                onClick={() => setShopOpen(false)}
              >
                {t("shopAll")} →
              </Link>
            </div>

            {featured && featuredCover ? (
              <Link
                href={`/product/${featured.slug}`}
                className="group relative block overflow-hidden bg-[#1c1a19]"
                onClick={() => setShopOpen(false)}
              >
                <div className="relative min-h-[17rem] w-full">
                  <Image
                    src={featuredCover.src}
                    alt={localize(featured.name, locale)}
                    fill
                    sizes="360px"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c]/85 via-[#0e0d0c]/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[#c9a08a]">
                      {t("featured")}
                    </p>
                    <p className="mt-2 font-display text-2xl leading-tight text-[#f4efe8]">
                      {localize(featured.name, locale)}
                    </p>
                    <p className="mt-1.5 text-sm text-[#f4efe8]/65">
                      {formatBdt(featured.price, locale)}
                    </p>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
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
            "absolute inset-x-0 top-0 flex h-[100dvh] max-h-[100dvh] flex-col border-b border-white/10 bg-[#121110] pt-[4.25rem] text-[#f4efe8] shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:pt-[5rem]",
            open ? "translate-y-0" : "-translate-y-[105%]",
          )}
        >
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-12 pt-3 [-webkit-overflow-scrolling:touch] sm:px-8"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="mb-6 h-px w-10 bg-gradient-to-r from-[#c9a08a] to-transparent" />

            <nav aria-label="Mobile">
              <Link
                href="/"
                className="flex items-center justify-between border-b border-white/10 py-4"
                onClick={() => setOpen(false)}
              >
                <span className="font-display text-3xl tracking-[-0.02em]">
                  {t("home")}
                </span>
              </Link>

              <div className="border-b border-white/10">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left"
                  aria-expanded={mobileShopOpen}
                  onClick={() => setMobileShopOpen((v) => !v)}
                >
                  <span className="font-display text-3xl tracking-[-0.02em]">
                    {t("products")}
                  </span>
                  <span
                    className={cn(
                      "text-sm text-[#c9a08a] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      mobileShopOpen && "rotate-180",
                    )}
                  >
                    ▾
                  </span>
                </button>

                <SmoothCollapse open={mobileShopOpen} durationClass="duration-500">
                  <div className="pb-5">
                    <Link
                      href="/products"
                      className="mb-4 inline-flex text-[10px] uppercase tracking-[0.2em] text-[#c9a08a]"
                      onClick={() => setOpen(false)}
                    >
                      {t("shopAll")} →
                    </Link>

                    <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]/8">
                      {t("categories")}
                    </p>
                    <ul>
                      {categories.map((c) => (
                        <li key={c}>
                          <Link
                            href={`/products?category=${c}`}
                            className="group flex items-center justify-between py-3 text-[16px] text-[#f4efe8]/85 transition hover:text-[#f4efe8]"
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

                    {featured && featuredCover ? (
                      <Link
                        href={`/product/${featured.slug}`}
                        className="mt-5 block overflow-hidden border border-white/10"
                        onClick={() => setOpen(false)}
                      >
                        <div className="grid grid-cols-[5.5rem_1fr]">
                          <div className="relative aspect-[4/5] bg-[#1c1a19]">
                            <Image
                              src={featuredCover.src}
                              alt={localize(featured.name, locale)}
                              fill
                              sizes="88px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col justify-center px-4 py-3">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#c9a08a]">
                              {t("featured")}
                            </p>
                            <p className="mt-1 font-display text-lg leading-snug text-[#f4efe8]">
                              {localize(featured.name, locale)}
                            </p>
                            <p className="mt-1 text-xs text-[#f4efe8]/55">
                              {formatBdt(featured.price, locale)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                </SmoothCollapse>
              </div>

              <Link
                href="/about"
                className="flex items-center justify-between border-b border-white/10 py-4"
                onClick={() => setOpen(false)}
              >
                <span className="font-display text-3xl tracking-[-0.02em]">
                  {t("about")}
                </span>
              </Link>

              <Link
                href="/contact"
                className="flex items-center justify-between border-b border-white/10 py-4"
                onClick={() => setOpen(false)}
              >
                <span className="font-display text-3xl tracking-[-0.02em]">
                  {t("contact")}
                </span>
              </Link>
            </nav>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Link
                href="/wishlist"
                className="flex items-center justify-between gap-3 border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]/75 transition hover:border-[#c9a08a]/40 hover:text-[#f4efe8]"
                onClick={() => setOpen(false)}
              >
                <span>{t("wishlist")}</span>
                <span className="tabular-nums text-[#c9a08a]">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-between gap-3 border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]/75 transition hover:border-[#c9a08a]/40 hover:text-[#f4efe8]"
                onClick={() => setOpen(false)}
              >
                <span>{t("cart")}</span>
                <span className="tabular-nums text-[#c9a08a]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
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
