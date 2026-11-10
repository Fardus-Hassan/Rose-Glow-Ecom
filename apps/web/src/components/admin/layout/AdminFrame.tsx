"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "./AuthGate";
import { AdminShell } from "./AdminShell";

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="admin-surface min-h-screen">{children}</div>;
  }

  return (
    <div className="admin-surface min-h-screen">
      <AuthGate>
        <AdminShell>{children}</AdminShell>
      </AuthGate>
    </div>
  );
}
