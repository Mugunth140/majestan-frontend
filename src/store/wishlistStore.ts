"use client";

import { create } from "zustand";
import { getWishlist, getWishlistCount, toggleWishlist, type WishlistItem } from "@/lib/api/wishlist";
import { getWishlistGuestId } from "@/lib/wishlist-guest";

const keyOf = (propertyType: string, propertyId: number) =>
  `${propertyType.toLowerCase()}:${propertyId}`;

type WishlistState = {
  items: WishlistItem[];
  count: number;
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: number | null;
  sync: () => Promise<void>;
  isWished: (propertyType: string, propertyId: number) => boolean;
  toggle: (propertyType: string, propertyId: number) => Promise<boolean>;
};

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  count: 0,
  loading: false,
  syncing: false,
  lastSyncedAt: null,

  sync: async () => {
    const guestId = getWishlistGuestId();
    if (!guestId) return;
    set({ syncing: true });
    try {
      const [list, count] = await Promise.all([
        getWishlist(guestId).catch(() => ({ items: [], total: 0 })),
        getWishlistCount(guestId).catch(() => ({ total: 0 })),
      ]);
      set({
        items: list.items ?? [],
        count: count.total ?? list.total ?? 0,
        lastSyncedAt: Date.now(),
      });
    } finally {
      set({ syncing: false, loading: false });
    }
  },

  isWished: (propertyType, propertyId) => {
    const k = keyOf(propertyType, propertyId);
    return get().items.some((i) => keyOf(i.propertyType, i.propertyId) === k);
  },

  toggle: async (propertyType, propertyId) => {
    const guestId = getWishlistGuestId();
    if (!guestId) throw new Error("Missing guest id");
    const k = keyOf(propertyType, propertyId);
    const wasWished = get().items.some((i) => keyOf(i.propertyType, i.propertyId) === k);

    set((s) => ({
      count: Math.max(0, s.count + (wasWished ? -1 : 1)),
      items: wasWished
        ? s.items.filter((i) => keyOf(i.propertyType, i.propertyId) !== k)
        : [
            ...s.items,
            { id: -Date.now(), propertyId, propertyType, legacyPropertyType: propertyType, property: null },
          ],
    }));

    try {
      const res = await toggleWishlist({ guestId, propertyId, propertyType });
      set({ count: res.total });
      await get().sync();
      return res.wished;
    } catch (err) {
      await get().sync();
      throw err;
    }
  },
}));
