import { AdminShell } from "@/components/layout/AdminShell";
import { AuthGate } from "@/components/layout/AuthGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
