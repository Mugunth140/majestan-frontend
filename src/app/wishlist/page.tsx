import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/site/wishlist/WishlistPageClient";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved properties. Sign in with your phone number to sync your wishlist.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
