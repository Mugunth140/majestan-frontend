import type { Metadata } from "next";
import { AuthPage } from "@/components/site/auth/auth-page";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { SiteHeader } from "@/components/site/layout/site-header";

export const metadata: Metadata = {
  title: "Register | Majestan Realty",
  description: "Create a Majestan Realty account.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <AuthPage mode="register" />
      <SiteFooter />
    </>
  );
}
