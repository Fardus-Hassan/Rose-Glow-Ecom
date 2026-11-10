import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/providers";
import { AdminFrame } from "@/components/admin/layout/AdminFrame";

export const metadata: Metadata = {
  title: "Rose Glow Admin",
  description: "Rose Glow e-commerce administration",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <AdminFrame>{children}</AdminFrame>
    </AdminProviders>
  );
}
