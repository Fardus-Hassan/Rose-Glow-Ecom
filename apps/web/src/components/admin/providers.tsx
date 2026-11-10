"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/admin/auth";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
