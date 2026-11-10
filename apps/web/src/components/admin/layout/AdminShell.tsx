"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "@/lib/admin/auth";
import { api } from "@/lib/admin/api";
import { navGroups } from "@/components/admin/nav";

const isActive = (pathname: string, href: string) =>
  href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ unread: number }>("/admin/stats")
      .then((res) => setUnread(res.unread || 0))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebar = (
    <aside className="relative flex h-full w-64 flex-col overflow-hidden border-r border-white/[0.08] bg-[#121110] text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(201,160,138,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(201,160,138,0.08), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            Rose Glow
          </p>
          <p className="font-display text-xl leading-none tracking-[-0.02em]">
            Admin
          </p>
        </div>
        <button
          type="button"
          className="rounded-sm p-1 text-cream/70 transition hover:bg-white/5 hover:text-cream lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="admin-sidebar-scroll relative flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title || "main"} className="mt-5 first:mt-0">
            {group.title ? (
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#c9a08a]/55">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, badgeKey }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={clsx(
                        "group relative flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] transition",
                        active
                          ? "bg-white/[0.08] text-cream shadow-[inset_0_0_0_1px_rgba(201,160,138,0.12)]"
                          : "text-cream/60 hover:bg-white/[0.04] hover:text-cream",
                      )}
                    >
                      <span
                        className={clsx(
                          "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full transition",
                          active
                            ? "bg-[#c9a08a] opacity-100"
                            : "bg-[#c9a08a] opacity-0 group-hover:opacity-40",
                        )}
                        aria-hidden
                      />
                      <Icon
                        className={clsx(
                          "h-4 w-4 shrink-0 transition",
                          active
                            ? "text-[#c9a08a]"
                            : "text-cream/45 group-hover:text-cream/80",
                        )}
                      />
                      <span className="flex-1">{label}</span>
                      {badgeKey === "unread" && unread > 0 ? (
                        <span className="min-w-[1.15rem] rounded-full bg-[#c9a08a] px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-[#121110]">
                          {unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative shrink-0 border-t border-white/[0.08] bg-black/20 px-5 py-4 backdrop-blur-[2px]">
        <p className="truncate text-xs text-cream/85">{user?.email}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#c9a08a]/90">
          {user?.role}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="/en"
            target="_blank"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-cream/50 transition hover:text-[#c9a08a]"
          >
            View site <ExternalLink className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-[10px] uppercase tracking-[0.16em] text-cream/50 transition hover:text-cream"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="admin-main-scroll min-h-screen overflow-x-hidden bg-paper">
      <Toaster position="top-right" richColors />
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-ink/10 bg-paper/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          className="rounded-sm p-1 transition hover:bg-ink/5"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="font-display text-lg">Rose Glow Admin</p>
      </div>

      <div className="lg:flex">
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64">
          {sidebar}
        </div>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
              aria-label="Close overlay"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-64 shadow-[8px_0_40px_rgba(0,0,0,0.35)]">
              {sidebar}
            </div>
          </div>
        ) : null}
        <div className="min-h-screen flex-1 lg:pl-64">
          <main className="rg-fade-in px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
