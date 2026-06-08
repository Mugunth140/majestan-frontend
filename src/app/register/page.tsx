import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register | Majestan Realty",
  description: "Create a Majestan Realty account.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage(): React.JSX.Element {
  redirect("/login");
}
