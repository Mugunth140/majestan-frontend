"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Trash2, MapPin, Phone, ArrowUpRight, BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { useUserAuthStore } from "@/store/userAuthStore";
import { useWishlistStore } from "@/store/wishlistStore";

function formatINR(value: unknown): string {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "Price on Request";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(2).replace(/\.?0+$/, "")} Lakh`;
  return `₹ ${num.toLocaleString("en-IN")}`;
}

type CardData = {
  title: string;
  location: string;
  photo: string | null;
  slug: string | null;
  price: unknown;
  postLabel: string | null;
};

function getCardData(p: Record<string, any>, isProject: boolean, propertyId: number): CardData {
  const photo =
    (typeof p.coverImageUrl === "string" && p.coverImageUrl) ||
    (typeof p.cover_image_url === "string" && p.cover_image_url) ||
    (typeof p.photo1 === "string" && p.photo1) ||
    (typeof p.photo2 === "string" && p.photo2) ||
    (typeof p.image === "string" && p.image) ||
    null;
  const slug =
    (typeof p.canonical_slug === "string" && p.canonical_slug) ||
    (typeof p.canonicalSlug === "string" && p.canonicalSlug) ||
    (typeof p.slug_url === "string" && p.slug_url) ||
    (typeof p.slug === "string" && p.slug) ||
    null;
  const post = typeof p.posttype === "string" ? p.posttype.toLowerCase() : "";
  return {
    title: String(p.propertyname ?? p.title ?? p.name ?? (isProject ? `Project #${propertyId}` : `Property #${propertyId}`)),
    location: String(p.sublocation ?? p.city ?? p.address ?? ""),
    photo,
    slug,
    price: p.expectedsaleprice ?? p.monthly_rent ?? p.price ?? null,
    postLabel: post === "sell" ? "For Sale" : post === "rent" ? "For Rent" : null,
  };
}

export function WishlistPageClient() {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const user = useUserAuthStore((s) => s.user);
  const items = useWishlistStore((s) => s.items);
  const count = useWishlistStore((s) => s.count);
  const syncing = useWishlistStore((s) => s.syncing);
  const sync = useWishlistStore((s) => s.sync);
  const toggle = useWishlistStore((s) => s.toggle);
  const [authOpen, setAuthOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) void sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const handleRemove = async (propertyType: string, propertyId: number) => {
    const k = `${propertyType}:${propertyId}`;
    setRemoving(k);
    setActionError(null);
    try {
      await toggle(propertyType, propertyId);
    } catch {
      setActionError("Couldn't update your wishlist. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="h-[64px]!" aria-hidden="true" />
      <div className="bg-[#f8f9fa]! min-h-screen! font-manrope">
        <div className="mx-auto! max-w-7xl! px-4! pt-5! pb-24!">
          <Breadcrumbs items={[{ label: "Wishlist" }]} jsonLd />

          <div className="mt-4! flex! flex-col! gap-2!">
            <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight!">My Wishlist</h1>
            <p className="text-sm! text-gray-500!">
              {isAuthenticated
                ? syncing
                  ? "Syncing your saved homes…"
                  : count > 0
                    ? `${count} saved ${count === 1 ? "home" : "homes"}`
                    : "You haven't saved any homes yet."
                : "Sign in with your phone number to see and sync saved homes."}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="mt-8! rounded-[24px]! border! border-gray-200! bg-white! p-8! md:p-12! text-center!">
              <div className="mx-auto! flex! h-14! w-14! items-center! justify-center! rounded-full! bg-[#27427f]/10! text-[#27427f]!">
                <Heart className="h-6! w-6!" />
              </div>
              <h2 className="mt-4! text-xl! font-semibold! text-gray-900!">Login to view your wishlist</h2>
              <p className="mx-auto! mt-2! max-w-md! text-sm! text-gray-500!">
                Use your mobile number to sign in. SMS / WhatsApp OTP verification will appear here
                once those APIs land — for now the standard phone login unlocks the wishlist.
              </p>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="mt-6! inline-flex! items-center! gap-2! rounded-full! bg-[#27427f]! px-6! py-3! text-sm! font-semibold! text-white! hover:bg-[#1e3366]! cursor-pointer!"
              >
                <Phone className="h-4! w-4!" />
                Sign in with phone
              </button>
            </div>
          ) : syncing && items.length === 0 ? (
            <div className="mt-8! flex! items-center! justify-center! gap-2! rounded-[24px]! border! border-gray-200! bg-white! p-12! text-sm! text-gray-500!">
              <Loader2 className="h-4! w-4! animate-spin!" /> Loading your wishlist…
            </div>
          ) : items.length === 0 ? (
            <div className="mt-8! rounded-[24px]! border! border-gray-200! bg-white! p-8! md:p-12! text-center!">
              <div className="mx-auto! flex! h-14! w-14! items-center! justify-center! rounded-full! bg-gray-100! text-gray-400!">
                <Heart className="h-6! w-6!" />
              </div>
              <h2 className="mt-4! text-xl! font-semibold! text-gray-900!">No saved homes yet</h2>
              <p className="mx-auto! mt-2! max-w-md! text-sm! text-gray-500!">
                Tap the heart on any property to save it here. Your list syncs with the backend.
              </p>
              <Link
                href="/"
                className="mt-6! inline-flex! items-center! rounded-full! bg-gray-900! px-6! py-3! text-sm! font-medium! text-white! no-underline! hover:bg-gray-800!"
              >
                Browse properties
              </Link>
            </div>
          ) : (
            <>
              {actionError ? (
                <div className="mt-6! rounded-xl! border! border-red-200! bg-red-50! px-4! py-3! text-[13px]! font-medium! text-red-700!">
                  {actionError}
                </div>
              ) : null}
              <div className="mt-8! grid! grid-cols-1! md:grid-cols-2! gap-4!">
              {items.map((item) => {
                const p = (item.property ?? {}) as Record<string, any>;
                const isProject = item.propertyType.toLowerCase() === "project";
                const gone = !item.property;
                const card = getCardData(p, isProject, item.propertyId);
                const builder = p.builder_name ?? p.builderName;
                const k = `${item.propertyType}:${item.propertyId}`;
                const busy = removing === k;
                if (gone) {
                  return (
                    <div
                      key={k}
                      className="flex! items-center! gap-3! rounded-2xl! border! border-gray-200/70! bg-gray-50! px-4! py-3!"
                    >
                      <div className="flex! h-11! w-11! shrink-0! items-center! justify-center! rounded-xl! bg-white! border! border-gray-200/70! text-gray-300!">
                        <Heart className="h-5! w-5!" />
                      </div>
                      <div className="min-w-0! flex-1!">
                        <p className="truncate! text-[14px]! font-semibold! text-gray-500!">
                          Saved {isProject ? "project" : "home"} #{item.propertyId}
                        </p>
                        <p className="truncate! text-[12px]! text-gray-400!">
                          {isProject ? "Project" : item.propertyType} · ID {item.propertyId} · No longer available
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRemove(item.propertyType, item.propertyId)}
                        className="inline-flex! shrink-0! items-center! gap-1.5! rounded-full! border! border-gray-200! bg-white! px-3! py-1.5! text-[12px]! font-medium! text-gray-500! transition-colors! hover:border-red-200! hover:text-red-600! hover:bg-red-50! cursor-pointer! disabled:opacity-60!"
                        aria-label={`Remove saved item ${item.propertyId} from wishlist`}
                      >
                        {busy ? <Loader2 className="h-3.5! w-3.5! animate-spin!" /> : <Trash2 className="h-3.5! w-3.5!" />}
                        Remove
                      </button>
                    </div>
                  );
                }
                return (
                  <div
                    key={k}
                    className="group! flex! gap-4! rounded-2xl! border! border-gray-200/70! bg-white! p-4! shadow-sm! transition-all! duration-300! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]!"
                  >
                    {/* Photo */}
                    {card.photo ? (
                      card.slug ? (
                        <Link href={`/${card.slug}`} className="shrink-0! no-underline!">
                          <img
                            src={card.photo}
                            alt={card.title}
                            loading="lazy"
                            className="h-24! w-24! sm:h-28! sm:w-28! rounded-xl! object-cover! group-hover:scale-[1.02]! transition-transform! duration-500!"
                          />
                        </Link>
                      ) : (
                        <img
                          src={card.photo}
                          alt={card.title}
                          loading="lazy"
                          className="h-24! w-24! sm:h-28! sm:w-28! rounded-xl! object-cover! shrink-0!"
                        />
                      )
                    ) : (
                      <div className="flex! h-24! w-24! sm:h-28! sm:w-28! shrink-0! items-center! justify-center! rounded-xl! bg-gradient-to-br! from-[#27427f]/10! to-[#27427f]/5! text-3xl! font-semibold! text-[#27427f]/25!">
                        {card.title.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Body */}
                    <div className="min-w-0! flex-1!">
                      <div className="flex! items-center! gap-2!">
                        <span className="inline-flex! items-center! rounded-full! bg-[#27427f]/8! px-2.5! py-0.5! text-[10px]! font-bold! uppercase! tracking-wider! text-[#27427f]!">
                          {isProject ? "Project" : item.propertyType}
                        </span>
                        {card.postLabel ? (
                          <span className="inline-flex! items-center! rounded-full! bg-emerald-50! px-2.5! py-0.5! text-[10px]! font-bold! uppercase! tracking-wider! text-emerald-700!">
                            {card.postLabel}
                          </span>
                        ) : null}
                      </div>

                      {card.slug ? (
                        <Link
                          href={`/${card.slug}`}
                          className="mt-1.5! block! truncate! text-[16px]! font-semibold! text-gray-900! no-underline! hover:text-[#27427f]! transition-colors!"
                        >
                          {card.title}
                        </Link>
                      ) : (
                        <p className="mt-1.5! truncate! text-[16px]! font-semibold! text-gray-900!">
                          {card.title}
                        </p>
                      )}

                      {card.location ? (
                        <p className="mt-1! flex! items-center! gap-1.5! truncate! text-[13px]! text-gray-500!">
                          <MapPin className="h-3.5! w-3.5! shrink-0! text-gray-400!" /> {card.location}
                        </p>
                      ) : null}

                      {isProject ? (
                        <p className="mt-1.5! flex! items-center! gap-1.5! text-[14px]! font-semibold! text-[#27427f]!">
                          {builder ? (
                            <>
                              <BadgeCheck className="h-4! w-4! shrink-0!" /> By {builder}
                            </>
                          ) : (
                            "View project"
                          )}
                        </p>
                      ) : (
                        <p className="mt-1.5! text-[17px]! font-semibold! text-[#27427f]!">{formatINR(card.price)}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex! shrink-0! flex-col! items-end! justify-between! gap-2!">
                      {card.slug ? (
                        <Link
                          href={`/${card.slug}`}
                          aria-label={`View ${card.title}`}
                          className="inline-flex! h-9! w-9! items-center! justify-center! rounded-full! bg-[#27427f]/5! text-[#27427f]! no-underline! transition-colors! hover:bg-[#27427f]! hover:text-white!"
                        >
                          <ArrowUpRight className="h-4! w-4!" />
                        </Link>
                      ) : (
                        <span className="h-9!" />
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRemove(item.propertyType, item.propertyId)}
                        className="inline-flex! items-center! gap-1.5! rounded-full! border! border-gray-200! px-3! py-1.5! text-[12px]! font-medium! text-gray-500! transition-colors! hover:border-red-200! hover:text-red-600! hover:bg-red-50! cursor-pointer! disabled:opacity-60!"
                        aria-label={`Remove ${card.title} from wishlist`}
                      >
                        {busy ? <Loader2 className="h-3.5! w-3.5! animate-spin!" /> : <Trash2 className="h-3.5! w-3.5!" />}
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
      <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
