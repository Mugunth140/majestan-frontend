import type { Metadata } from "next";
import { AuthPage } from "@/components/site/auth/auth-page";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { SiteHeader } from "@/components/site/layout/site-header";

export const metadata: Metadata = {
  title: "Login | Majestan Realty",
  description: "Login to your Majestan Realty account.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <AuthPage mode="login" />
      <SiteFooter />
    </>
  );
}
