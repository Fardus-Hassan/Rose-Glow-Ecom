"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/content", label: "Content" },
  { href: "/pages", label: "Pages" },
  { href: "/seo", label: "SEO" },
  { href: "/reviews", label: "Reviews" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-white/10 bg-night text-cream">
        <div className="border-b border-white/10 px-6 py-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-rose">
            Rose Glow
          </p>
          <p className="mt-2 font-display text-2xl leading-tight">
            Admin Atelier
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block border-l-2 py-2.5 pl-4 pr-3 text-[11px] uppercase tracking-[0.16em] transition rg-ease",
                  active
                    ? "border-rose bg-white/5 text-cream"
                    : "border-transparent text-cream/65 hover:border-rose/50 hover:bg-white/[0.03] hover:text-cream",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-5">
          <p className="truncate text-xs text-cream/80">{user?.email}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-rose/90">
            {user?.role}
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 text-[10px] uppercase tracking-[0.2em] text-cream/55 transition hover:text-cream"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col pl-60">
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 px-8 py-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
            Editorial commerce · Dhaka
          </p>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
