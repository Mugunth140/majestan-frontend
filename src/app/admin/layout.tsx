import type { Metadata } from "next";
import { SeoAdminShell } from "./seo-admin-shell";
import "./seo-admin.css";
export const metadata: Metadata = {
  title: { absolute: "Admin Panel | Majestan Realty" },
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SeoAdminShell>{children}</SeoAdminShell>;
}
