import { useUserAuthStore } from "@/store/userAuthStore";

const GUEST_KEY = "majestan_wishlist_guest";

function randomGuest(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `guest-${Date.now().toString(36)}-${rand}`;
}

/**
 * Stable wishlist guestId for the backend ( /^[A-Za-z0-9_-]+$/, 6-64 chars ).
 * Authenticated users get `user-<id>` so the wishlist follows the account.
 * Anonymous visitors get a persisted `guest-…` id (used after OTP lands).
 */
export function getWishlistGuestId(): string {
  if (typeof window === "undefined") return "";
  try {
    const { isAuthenticated, user } = useUserAuthStore.getState();
    if (isAuthenticated && user?.id != null) return `user-${user.id}`;
    const existing = window.localStorage.getItem(GUEST_KEY);
    if (existing && /^[A-Za-z0-9_-]{6,64}$/.test(existing)) return existing;
    const next = randomGuest();
    window.localStorage.setItem(GUEST_KEY, next);
    return next;
  } catch {
    return randomGuest();
  }
}
