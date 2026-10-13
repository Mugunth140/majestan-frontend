import type { Metadata } from "next";
import { PostPropertyScreen } from "@/components/site/owner-post/PostPropertyScreen";

export const metadata: Metadata = {
  title: "Post your property for sale or rent",
  description:
    "List your property with Majestan Realty. Share your location, property details, price and photos in a guided form. Every listing is reviewed by our team.",
  robots: { index: false, follow: true },
};
export default function PostPropertyPage() {
  return <PostPropertyScreen />;
}
