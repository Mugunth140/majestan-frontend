import type { Metadata } from "next";
import { SeoAdminShell } from "./seo-admin-shell";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
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
  return (
    <Theme
      accentColor="blue"
      grayColor="slate"
      radius="medium"
      appearance="light"
      scaling="100%"
    >
      <SeoAdminShell>{children}</SeoAdminShell>
    </Theme>
  );
}
