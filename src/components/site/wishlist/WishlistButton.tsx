"use client";

import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";

type Props = {
  propertyId: number;
  propertyType: string;
  variant?: "icon" | "pill";
  className?: string;
  label?: string;
  /** "onImage" renders a white heart suited for overlaying photos. */
  tone?: "default" | "onImage";
};

/**
 * Auth-gated wishlist toggle wired to POST /wishlist/toggle.
 * OTP (SMS/WhatsApp) lands later inside UserAuthModal — this button
 * just requires a verified session before calling the backend.
 */
export function WishlistButton({ propertyId, propertyType, variant = "icon", className, label = "Save", tone = "default" }: Props) {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const wished = useWishlistStore((s) => s.isWished(propertyType, propertyId));
  const toggle = useWishlistStore((s) => s.toggle);
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busyRef.current) return;
    setError(null);
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await toggle(propertyType, propertyId);
    } catch {
      setError("Couldn't update wishlist. Try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (variant === "pill") {
    return (
      <>
        <button
          type="button"
          onClick={onClick}
          aria-pressed={wished}
          aria-busy={busy}
          title={error ?? (wished ? "Saved to wishlist" : "Save to wishlist")}
          className={`inline-flex! items-center! gap-2! px-5! py-2! rounded-xl! border! text-sm! font-medium! transition-all! shadow-sm! cursor-pointer! ${
            wished
              ? "border-red-200! bg-red-50! text-red-600!"
              : "border-gray-200! bg-white! text-gray-600! hover:border-red-200! hover:text-red-600! hover:bg-red-50!"
          } ${className ?? ""}`}
        >
          <Heart className={`w-4! h-4! ${wished ? "fill-red-500! text-red-500!" : ""} ${busy ? "animate-pulse!" : ""}`} />
          {wished ? "Saved" : label}
        </button>
        <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  const heartSize = tone === "onImage" ? "w-5! h-5! drop-shadow-md!" : "w-4! h-4!";
  const idleHeart = tone === "onImage" ? "text-white! fill-transparent! hover:text-pink-400! hover:fill-pink-400!" : "text-gray-400! fill-transparent! hover:text-pink-400! hover:fill-pink-400!";

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={wished}
        aria-busy={busy}
        aria-label="Save to wishlist"
        title={error ?? (wished ? "Saved to wishlist" : "Save to wishlist")}
        className={`rounded-full! transition-colors! cursor-pointer! shrink-0! ${tone === "onImage" ? "p-1.5! hover:scale-110! transition-transform!" : "p-2! hover:bg-gray-100!"} ${className ?? ""}`}
      >
        <Heart
          className={`${heartSize} transition-colors! ${
            wished ? "text-pink-500! fill-pink-500!" : idleHeart
          } ${busy ? "animate-pulse!" : ""}`}
        />
      </button>
      <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
