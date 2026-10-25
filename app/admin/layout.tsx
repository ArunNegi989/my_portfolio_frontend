import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

// Every /admin page renders inside AdminShell, which shows nothing until the backend confirms an
// admin session. The data itself is protected server-side: each admin API checks session + role.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
