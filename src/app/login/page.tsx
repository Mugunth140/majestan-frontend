import type { Metadata } from "next";
import { AuthPage } from "@/components/site/auth/auth-page";

export const metadata: Metadata = {
  title: "Login | Majestan Realty",
  description: "Login to your Majestan Realty account.",
  alternates: {
    canonical: "/login",
  },
  robots: { index: false, follow: false },
};

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="min-h-screen! bg-white! flex! items-center! justify-center!">
      <AuthPage />
    </main>
  );
}
