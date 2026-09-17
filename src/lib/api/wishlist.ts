import { API_BASE_URL } from "@/lib/api";

export type WishlistProperty = Record<string, unknown> & {
  id: number;
};

export type WishlistItem = {
  id: number;
  propertyId: number;
  propertyType: string;
  legacyPropertyType: string;
  property: WishlistProperty | null;
};

export type WishlistListResponse = {
  items: WishlistItem[];
  total: number;
};

export type WishlistToggleResponse = {
  wished: boolean;
  total: number;
};

async function wishlistFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wishlist request failed: ${res.status} ${body}`.slice(0, 300));
  }
  const payload = (await res.json()) as { success?: boolean; data?: T } | T;
  if (typeof payload === "object" && payload !== null && "success" in payload && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function getWishlist(guestId: string): Promise<WishlistListResponse> {
  return wishlistFetch<WishlistListResponse>(`/wishlist?guestId=${encodeURIComponent(guestId)}`);
}

export function getWishlistCount(guestId: string): Promise<{ total: number }> {
  return wishlistFetch<{ total: number }>(`/wishlist/count?guestId=${encodeURIComponent(guestId)}`);
}

export function toggleWishlist(payload: {
  guestId: string;
  propertyId: number;
  propertyType: string;
}): Promise<WishlistToggleResponse> {
  return wishlistFetch<WishlistToggleResponse>(`/wishlist/toggle`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
