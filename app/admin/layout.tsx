import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

// Phase 1: an UNPROTECTED frontend preview. Phase 2 adds real authentication here
// (e.g. a proxy.ts check plus server-side session validation) before rendering the shell.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
