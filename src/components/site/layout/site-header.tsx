"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  MapPin,
  Heart,
  ChevronDown,
  Building,
  House,
  Map,
  Palmtree,
  Store,
  Factory,
  Laptop,
  ListChecks,
  FileSignature,
  Handshake,
  CircleDollarSign,
  Globe,
  LocateFixed,
  LogOut,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { useLocationContext } from "@/contexts/LocationContext";
import { toLocationSlug } from "@/lib/seo-urls";
import { adsForAudience, resolveAdHref } from "@/lib/ads";
import { useAds } from "@/components/site/ads/use-ads";
import { useLockBodyScroll } from "@/components/site/shared/use-lock-body-scroll";

type MegaMenuLink = {
  text: string;
  href: string;
  icon: React.ReactNode;
};

const SERVICE_LINKS: MegaMenuLink[] = [
  { text: "Property Management", href: "/services/property-management", icon: <ListChecks size={18} /> },
  { text: "Liaisoning Service", href: "/services/liaisoning", icon: <FileSignature size={18} /> },
  { text: "Brokerage Service", href: "/services/professional-brokerage-services", icon: <Handshake size={18} /> },
  { text: "Financial Assistance", href: "/services/financial-assistance", icon: <CircleDollarSign size={18} /> },
  { text: "NRI Services", href: "/services/nri-property-investment", icon: <Globe size={18} /> },
];

type Category = "Buy" | "Rent" | "Services" | null;
const CATEGORIES = ["Buy", "Rent", "Services"] as const;

/**
 * Mega-menu promo art comes from the CRM Advertisement module (placement
 * "Navigation menu", 3:2). Each dropdown shows the ad targeted at its audience
 * (buy / rent / services), else an untargeted "All" ad. When nothing is
 * published, this static art is the last fallback — `null` renders the empty
 * tinted panel and issues no request.
 */
const MEGA_MENU_FALLBACK_ART: string | null = null;

/** Each mobile-menu row rises in after the panel starts to unroll. */
const menuItem = {
  open: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.23, 1, 0.32, 1] as const } },
  closed: { opacity: 0, y: 14, transition: { duration: 0.16 } },
};

/** Above this many cities the dropdown gets a search field. */
const CITY_SEARCH_THRESHOLD = 6;

const EASE = [0.23, 1, 0.32, 1] as const;

const FOCUS_RING =
  "focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]/40! focus-visible:ring-offset-2!";
const SECTION_LABEL = "m-0! text-[11px]! font-semibold! uppercase! tracking-[0.08em]! text-[#98a2b3]!";
const POPOVER =
  "absolute! right-0! top-full! z-[1010]! mt-3! rounded-2xl! border! border-solid! border-[#eaecf0]! bg-white! shadow-[0_20px_48px_-20px_rgba(16,24,40,0.3)]!";

/** The generic "no photo" avatar: a silhouette on a soft blue-grey disc. */
function DefaultAvatar({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex! shrink-0! overflow-hidden! rounded-full! bg-[#e3e8f1]!"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" className="h-full! w-full!">
        <circle cx="20" cy="16" r="7" fill="#9caac3" />
        <path d="M5.5 40c1.4-8.6 7.4-13 14.5-13s13.1 4.4 14.5 13z" fill="#9caac3" />
      </svg>
    </span>
  );
}

/**
 * Post Property: brand yellow with a soft top highlight and a hairline edge,
 * so it reads as a pressed-in surface rather than a flat sticker. On hover it
 * turns brand blue, with no shadow. A gradient can't be faded to a flat
 * colour, so the blue is its own layer (PostPropertyHover) that fades in.
 */
const POST_PROPERTY_BUTTON =
  "group/pp relative! isolate! overflow-hidden! inline-flex! items-center! justify-center! rounded-full! border! border-solid! border-[#e9b500]! bg-[linear-gradient(180deg,#ffd84a_0%,#ffc700_100%)]! font-bold! leading-none! text-[#101828]! no-underline! shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_2px_rgba(16,24,40,0.08)]! transition-[border-color,color,box-shadow,transform]! duration-200! ease-out! hover:border-[#27427f]! hover:text-white! hover:shadow-none! active:scale-[0.98]!";

/** The blue that fades in over the yellow on hover. */
function PostPropertyHover() {
  return (
    <span
      aria-hidden="true"
      className="absolute! inset-0! -z-10! bg-[#27427f]! opacity-0! transition-opacity! duration-200! ease-out! group-hover/pp:opacity-100!"
    />
  );
}

/** "Free", pinned to the button's top-right corner, outside its edge. */
function FreeBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none! absolute! -top-2! -right-2! rounded-full! border-2! border-solid! border-white! bg-[#16a34a]! px-1.5! py-[3px]! text-[10px]! font-extrabold! uppercase! leading-none! tracking-[0.06em]! text-white! shadow-[0_2px_6px_-2px_rgba(22,163,74,0.6)]!"
    >
      Free
    </span>
  );
}

/** Radio-style mark for the city rows. */
function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex! h-[18px]! w-[18px]! shrink-0! items-center! justify-center! rounded-full! border-2! border-solid! transition-colors! duration-150! ${
        checked ? "border-[#27427f]!" : "border-[#d0d5dd]!"
      }`}
    >
      {checked && <span className="h-2! w-2! rounded-full! bg-[#27427f]!" />}
    </span>
  );
}

export function SiteHeader(): React.JSX.Element {
  const {
    location,
    setLocation,
    cities,
    isLoadingCities,
    isLocating,
    updateLocation,
  } = useLocationContext();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useUserAuthStore();
  const wishlistCount = useWishlistStore((s) => s.count);
  const syncWishlist = useWishlistStore((s) => s.sync);
  const [hoveredCategory, setHoveredCategory] = useState<Category>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCityOpen, setIsMobileCityOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<Category>(null);
  /**
   * Art URLs that failed to load, so a broken creative degrades to the next
   * fallback (or the empty tinted panel) instead of a broken-image glyph.
   */
  const [failedArt, setFailedArt] = useState<ReadonlySet<string>>(() => new Set());
  // One small request per page load, so the art is ready before the first hover.
  const menuAds = useAds("mega_menu");
  const reduceMotion = useReducedMotion();
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useLockBodyScroll(isMobileMenuOpen);

  // The header is `fixed`, so every page that renders a full-bleed hero at the
  // very top needs to know how tall it actually is. Publishing the measured
  // height as --site-header-h keeps that offset exact at every breakpoint.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) document.documentElement.style.setProperty("--site-header-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Every popover closes on an outside press or Escape.
  useEffect(() => {
    const anyOpen = isLocationMenuOpen || isAccountMenuOpen || hoveredCategory;
    if (!anyOpen) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (locationMenuRef.current && !locationMenuRef.current.contains(target)) setIsLocationMenuOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) setIsAccountMenuOpen(false);
      if (headerRef.current && !headerRef.current.contains(target)) setHoveredCategory(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsLocationMenuOpen(false);
      setIsAccountMenuOpen(false);
      setHoveredCategory(null);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isLocationMenuOpen, isAccountMenuOpen, hoveredCategory]);

  // Escape closes the mobile menu too.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) void syncWishlist();
  }, [isAuthenticated, user?.id, syncWishlist]);

  // Closing the menu also folds its open sections, so it reopens clean.
  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setIsMobileCityOpen(false);
    setOpenMobileSection(null);
  }

  const toggleLocationMenu = () => {
    setIsLocationMenuOpen((v) => !v);
    setCitySearch("");
  };

  const handleProtectedRoute = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };
  const detectLocation = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateLocation();
  };

  const getLinks = (cat: Category): MegaMenuLink[] => {
    const citySlug = toLocationSlug(location);
    switch (cat) {
      case "Buy":
        return [
          { text: "Apartments", href: `/for-sale/apartments/${citySlug}`, icon: <Building size={18} /> },
          { text: "Villas", href: `/for-sale/villas/${citySlug}`, icon: <House size={18} /> },
          { text: "Independent Houses", href: `/for-sale/independent-houses/${citySlug}`, icon: <House size={18} /> },
          { text: "Plots", href: `/for-sale/plots/${citySlug}`, icon: <Map size={18} /> },
          { text: "Farmlands", href: `/for-sale/farmlands/${citySlug}`, icon: <Palmtree size={18} /> },
          { text: "Commercial Spaces", href: `/for-sale/commercial-spaces/${citySlug}`, icon: <Store size={18} /> },
          { text: "Industrials", href: `/for-sale/industrial-spaces/${citySlug}`, icon: <Factory size={18} /> },
        ];
      case "Rent":
        return [
          { text: "Commercial", href: `/for-rent/commercial-spaces/${citySlug}`, icon: <Store size={18} /> },
          { text: "Industrial", href: `/for-rent/industrial-spaces/${citySlug}`, icon: <Factory size={18} /> },
          { text: "Apartment", href: `/for-rent/apartments/${citySlug}`, icon: <Building size={18} /> },
          { text: "Villa", href: `/for-rent/villas/${citySlug}`, icon: <House size={18} /> },
          { text: "Independent House", href: `/for-rent/independent-houses/${citySlug}`, icon: <House size={18} /> },
          { text: "Co-Working", href: `/for-rent/coworking/${citySlug}`, icon: <Laptop size={18} /> },
        ];
      case "Services":
        return SERVICE_LINKS;
      default:
        return [];
    }
  };

  const getMenuArt = (cat: Category): { src: string; href: string | null; alt: string } | null => {
    if (!cat) return null;
    const ad = adsForAudience(menuAds, cat.toLowerCase()).find((a) => !failedArt.has(a.desktopImage));
    if (ad) return { src: ad.desktopImage, href: resolveAdHref(ad, toLocationSlug(location)), alt: ad.title || "" };
    if (MEGA_MENU_FALLBACK_ART && !failedArt.has(MEGA_MENU_FALLBACK_ART)) {
      return { src: MEGA_MENU_FALLBACK_ART, href: null, alt: "" };
    }
    return null;
  };

  const getFeatured = (cat: Category) => {
    if (cat === "Buy") return { title: "Find your dream home" };
    if (cat === "Rent") return { title: "Verified rental properties" };
    if (cat === "Services") return { title: "Expert real estate help" };
    return null;
  };

  const realName = user?.name && user.name !== "Majestan User" ? user.name : "";
  const displayName = realName || user?.phone;

  const showCitySearch = cities.length > CITY_SEARCH_THRESHOLD;
  const filteredCities = citySearch.trim()
    ? cities.filter((c) => c.city.toLowerCase().includes(citySearch.trim().toLowerCase()))
    : cities;

  /** City rows, shared by the desktop dropdown and the mobile menu. */
  const renderCityRows = (onPick: () => void) => (
    <>
      {isLoadingCities && (
        <p className="m-0! px-3! py-2.5! text-[13px]! font-medium! text-[#667085]!">Loading cities…</p>
      )}
      {!isLoadingCities && filteredCities.length === 0 && (
        <p className="m-0! px-3! py-2.5! text-[13px]! font-medium! text-[#667085]!">
          {cities.length === 0 ? "No active cities available" : "No matching city"}
        </p>
      )}
      {filteredCities.map((city) => {
        const selected = location === city.city;
        return (
          <button
            key={city.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              setLocation(city.city);
              onPick();
            }}
            className={`flex! w-full! cursor-pointer! items-center! gap-3! rounded-xl! border-0! px-3! py-2.5! text-left! text-[14px]! transition-colors! duration-150! ${
              selected
                ? "bg-[#f5f8ff]! font-semibold! text-[#101828]!"
                : "bg-transparent! font-medium! text-[#344054]! hover:bg-[#f9fafb]! hover:text-[#101828]!"
            }`}
          >
            <RadioMark checked={selected} />
            {city.city}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={`font-manrope-page fixed! top-0! left-0! w-full! max-w-full! border-b! border-solid! bg-white/95! backdrop-blur-md! transition-[box-shadow,border-color]! duration-200! ${
          isMobileMenuOpen ? "z-[10002]! bg-white!" : "z-[1000]!"
        } ${
          isMobileMenuOpen
            ? "border-[#eaecf0]! shadow-none!"
            : isScrolled || hoveredCategory
            ? "border-[#eaecf0]! shadow-[0_6px_24px_-12px_rgba(16,24,40,0.18)]!"
            : "border-transparent! shadow-none!"
        }`}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="mx-auto! flex! h-[68px]! w-full! max-w-[1400px]! items-center! justify-between! gap-4! px-4! sm:px-6! lg:px-8!">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => isMobileMenuOpen && closeMobileMenu()}
            className={`inline-flex! shrink-0! rounded-md! ${FOCUS_RING}`}
            aria-label="Majestan Realty Home"
          >
            <img
              src="/assets/images/logo/logo.png"
              alt="Majestan Realty"
              className="h-9! w-auto! object-contain! sm:h-10! max-[400px]:h-8!"
            />
          </Link>

          {/* Desktop navigation: text only; the open menu is marked by colour
              and the turned chevron, not a pill. */}
          <nav className="hidden! flex-1! justify-center! lg:flex!" aria-label="Main navigation">
            <ul className="m-0! flex! list-none! items-center! gap-2! p-0!">
              {CATEGORIES.map((cat) => {
                const open = hoveredCategory === cat;
                return (
                  <li key={cat} onMouseEnter={() => setHoveredCategory(cat)}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-haspopup="true"
                      onClick={() => setHoveredCategory(open ? null : cat)}
                      onFocus={() => setHoveredCategory(cat)}
                      className={`inline-flex! h-[68px]! cursor-pointer! items-center! gap-1! border-0! bg-transparent! px-3! text-[15px]! font-semibold! leading-none! transition-colors! duration-150! ${FOCUS_RING} ${
                        open ? "text-[#27427f]!" : "text-[#344054]! hover:text-[#27427f]!"
                      }`}
                    >
                      {cat}
                      <ChevronDown
                        size={15}
                        strokeWidth={2.25}
                        className={`transition-transform! duration-200! ${open ? "rotate-180! text-[#27427f]!" : "text-[#98a2b3]!"}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right actions (desktop): city · account · post property.
              Below lg everything lives in the menu instead. */}
          <div className="hidden! shrink-0! items-center! gap-2! lg:flex!">
            {/* City */}
            <div className="relative!" ref={locationMenuRef}>
              <button
                type="button"
                onClick={toggleLocationMenu}
                aria-haspopup="dialog"
                aria-expanded={isLocationMenuOpen}
                aria-label={`City: ${location}`}
                className={`group/city inline-flex! h-10! cursor-pointer! items-center! gap-1.5! rounded-full! border-0! bg-transparent! px-2! text-[14px]! font-semibold! leading-none! text-[#101828]! transition-colors! duration-150! hover:text-[#27427f]! ${FOCUS_RING}`}
              >
                <MapPin size={17} strokeWidth={2.25} className={`text-[#27427f]! ${isLocating ? "animate-pulse!" : ""}`} />
                <span className="max-w-[120px]! truncate!">{location}</span>
                <ChevronDown
                  size={15}
                  strokeWidth={2.25}
                  className={`text-[#98a2b3]! transition-transform! duration-200! group-hover/city:text-[#27427f]! ${isLocationMenuOpen ? "rotate-180!" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isLocationMenuOpen && (
                  <motion.div
                    role="dialog"
                    aria-label="Choose your city"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -6, scale: reduceMotion ? 1 : 0.98 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{ transformOrigin: "top right" }}
                    className={`${POPOVER} w-[300px]! p-2!`}
                  >
                    <div className="px-2! pt-1.5! pb-3!">
                      <p className="m-0! text-[15px]! font-semibold! text-[#101828]!">Choose your city</p>
                      <p className="m-0! mt-0.5! text-[13px]! font-medium! text-[#667085]!">
                        We&apos;ll show properties around you.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        setIsLocationMenuOpen(false);
                        detectLocation(e);
                      }}
                      className="flex! h-10! w-full! cursor-pointer! items-center! justify-center! gap-2! rounded-xl! border! border-solid! border-[#d0d5dd]! bg-white! text-[14px]! font-semibold! text-[#27427f]! transition-colors! duration-150! hover:border-[#27427f]! hover:bg-[#f5f8ff]!"
                    >
                      <LocateFixed size={16} strokeWidth={2.25} />
                      Use my current location
                    </button>

                    {showCitySearch && (
                      <div className="mt-2! flex! h-10! items-center! gap-2! rounded-xl! bg-[#f2f4f7]! px-3!">
                        <Search size={15} className="shrink-0! text-[#98a2b3]!" />
                        <input
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="Search city"
                          aria-label="Search city"
                          className="m-0! h-full! min-w-0! flex-1! appearance-none! rounded-none! border-0! bg-transparent! p-0! text-[14px]! font-medium! text-[#101828]! shadow-none! outline-none! placeholder:text-[#98a2b3]!"
                        />
                      </div>
                    )}

                    <p className={`${SECTION_LABEL} px-3! pt-4! pb-1.5!`}>Available cities</p>
                    <div role="listbox" aria-label="City" className="grid! max-h-60! gap-0.5! overflow-y-auto!">
                      {renderCityRows(() => setIsLocationMenuOpen(false))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span aria-hidden="true" className="mx-1! h-6! w-px! bg-[#e4e7ec]!" />

            {/* Account: "Sign in" when logged out, a default avatar when in */}
            <div className="relative!" ref={accountMenuRef}>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={isAccountMenuOpen}
                  className={`inline-flex! cursor-pointer! items-center! gap-1! rounded-full! border-0! bg-transparent! p-0.5! pr-1.5! transition-colors! duration-150! hover:bg-[#f2f4f7]! ${FOCUS_RING}`}
                >
                  <DefaultAvatar size={36} />
                  <ChevronDown
                    size={15}
                    strokeWidth={2.25}
                    className={`text-[#98a2b3]! transition-transform! duration-200! ${isAccountMenuOpen ? "rotate-180!" : ""}`}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  aria-label="Account"
                  className={`inline-flex! h-10! cursor-pointer! items-center! justify-center! rounded-full! border-0! bg-transparent! px-3! text-[14px]! font-semibold! text-[#101828]! transition-colors! duration-150! hover:text-[#27427f]! ${FOCUS_RING}`}
                >
                  Sign in
                </button>
              )}
              <AnimatePresence>
                {isAuthenticated && isAccountMenuOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                    transition={{ duration: 0.16, ease: EASE }}
                    className={`${POPOVER} w-64! p-1.5!`}
                  >
                    <div className="mb-1! flex! items-center! gap-3! border-b! border-solid! border-[#f2f4f7]! px-2.5! pt-2! pb-3!">
                      <DefaultAvatar size={36} />
                      <div className="min-w-0!">
                        <p className="m-0! truncate! text-[14px]! font-semibold! text-[#101828]!">{displayName}</p>
                        <p className="m-0! text-[12px]! font-medium! text-[#667085]!">Signed in</p>
                      </div>
                    </div>
                    <Link
                      role="menuitem"
                      href="/wishlist"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex! items-center! gap-2.5! rounded-xl! px-3! py-2.5! text-[14px]! font-medium! text-[#344054]! no-underline! transition-colors! hover:bg-[#f9fafb]! hover:text-[#101828]!"
                    >
                      <Heart size={16} /> Saved properties
                      {wishlistCount > 0 && (
                        <span className="ml-auto! text-[12px]! font-semibold! text-[#667085]! tabular-nums!">{wishlistCount}</span>
                      )}
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        logout();
                      }}
                      className="flex! w-full! cursor-pointer! items-center! gap-2.5! rounded-xl! border-0! bg-transparent! px-3! py-2.5! text-left! text-[14px]! font-medium! text-[#d92d20]! transition-colors! hover:bg-[#fef3f2]!"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Post Property */}
            <span className="relative! ml-1! inline-flex!">
              <Link
                href="/post-property"
                aria-label="Post Property, free"
                className={`${POST_PROPERTY_BUTTON} h-[46px]! px-5! text-[14px]! ${FOCUS_RING}`}
                onClick={handleProtectedRoute}
              >
                <PostPropertyHover />
                Post Property
              </Link>
              <FreeBadge />
            </span>
          </div>

          {/* Menu trigger (below lg): a "Menu" pill. Its two lines fold into
              an X and the label reads "Close" while the menu is open. */}
          <button
            type="button"
            className={`inline-flex! h-10! shrink-0! cursor-pointer! items-center! gap-2.5! rounded-full! border! border-solid! pr-3! pl-4! text-[14px]! font-semibold! transition-colors! duration-200! lg:hidden! ${FOCUS_RING} ${
              isMobileMenuOpen
                ? "border-[#27427f]! bg-[#27427f]! text-white!"
                : "border-[#e4e7ec]! bg-white! text-[#101828]! hover:border-[#d0d5dd]!"
            }`}
            onClick={() => (isMobileMenuOpen ? closeMobileMenu() : setIsMobileMenuOpen(true))}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="relative! inline-block! w-[3.1em]! text-left!">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="inline-block!"
                >
                  {isMobileMenuOpen ? "Close" : "Menu"}
                </motion.span>
              </AnimatePresence>
            </span>
            <span aria-hidden="true" className="relative! block! h-3! w-[18px]!">
              <span
                className={`absolute! left-0! block! h-[2px]! w-[18px]! rounded-full! bg-current! transition-transform! duration-300! ease-[cubic-bezier(0.23,1,0.32,1)]! ${
                  isMobileMenuOpen ? "top-[5px]! rotate-45!" : "top-0.5!"
                }`}
              />
              <span
                className={`absolute! left-0! block! h-[2px]! w-[18px]! rounded-full! bg-current! transition-transform! duration-300! ease-[cubic-bezier(0.23,1,0.32,1)]! ${
                  isMobileMenuOpen ? "top-[5px]! -rotate-45!" : "top-[8px]!"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Desktop mega menu — the original overlay design */}
        <AnimatePresence>
          {hoveredCategory && (
            <motion.div
              initial={{ opacity: 0, y: 12, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 12, x: "-50%" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute! top-full left-1/2 z-1005 w-[min(920px,88vw)] pt-2.5!"
            >
              {/* Matches the service-page language: Manrope, medium weights, one
                  light surface, hairline rules. Not a dark promo card. */}
              <div className="font-manrope-page flex! gap-8 rounded-[20px] border border-gray-200! bg-white! p-7! shadow-[0_18px_44px_-24px_rgba(22,30,45,0.32)]!">
                <div className="flex-1 min-w-0">
                  <h2 className="m-0 text-[19px]! font-medium! leading-[1.2]! tracking-[-0.018em]! text-[#161e2d]! pb-[14px]! mb-[14px]! border-b! border-gray-200!">
                    {getFeatured(hoveredCategory)?.title}
                  </h2>
                  <div className="grid! grid-cols-2 gap-x-2 gap-y-0.5">
                    {getLinks(hoveredCategory).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setHoveredCategory(null)}
                        className="group flex! items-center! gap-3 rounded-[10px]! px-3! py-[9px]! text-[14px]! font-medium! leading-tight! text-gray-700! no-underline! transition-colors duration-150! hover:bg-[#f5f7fc]! hover:text-[#161e2d]!"
                      >
                        <span className="inline-flex! shrink-0 text-[#27427f] opacity-60! transition-opacity duration-150! group-hover:opacity-100!">
                          {link.icon}
                        </span>
                        <span>{link.text}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Promotional art. The image alone — no overlay copy, no icon
                    badge, no button — so the panel reads as navigation plus one
                    picture rather than a promo card bolted onto a menu.

                    3:2 art from the CRM (see getMenuArt). A creative that fails
                    to load is skipped for the next fallback, ending at the empty
                    tinted panel rather than a broken-image glyph. */}
                {(() => {
                  const art = getMenuArt(hoveredCategory);
                  const img = art && (
                    // Plain <img>: ad art is served from R2, which next/image isn't configured for.
                    <img
                      src={art.src}
                      alt={art.alt}
                      className="absolute! inset-0! w-full! h-full! object-cover!"
                      onError={() => setFailedArt((prev) => new Set(prev).add(art.src))}
                    />
                  );
                  const box = "relative! block! w-[300px]! shrink-0! self-start! aspect-[3/2]! overflow-hidden! rounded-[14px]! border! border-gray-200/80! bg-[#f5f7fc]!";
                  return art?.href ? (
                    <Link href={art.href} aria-label={art.alt || "Promotion"} className={box} onClick={() => setHoveredCategory(null)}>
                      {img}
                    </Link>
                  ) : (
                    <div className={box}>{img}</div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu. The header stays put (its Menu pill turns into Close)
          and the panel unrolls downward from under it, its rows following
          one after another; closing plays the same thing in reverse. It sits
          above the chat widget, which would otherwise cover the CTA. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: reduceMotion
                ? { opacity: 1 }
                : {
                    clipPath: "inset(0% 0% 0% 0%)",
                    transition: { duration: 0.5, ease: EASE, delayChildren: 0.12, staggerChildren: 0.045 },
                  },
              closed: reduceMotion
                ? { opacity: 0 }
                : {
                    clipPath: "inset(0% 0% 100% 0%)",
                    transition: { duration: 0.38, ease: [0.77, 0, 0.175, 1], when: "afterChildren", staggerChildren: 0.025, staggerDirection: -1 },
                  },
            }}
            className="font-manrope-page fixed! inset-x-0! bottom-0! top-[var(--site-header-h)]! z-[10001]! flex! flex-col! bg-white! lg:hidden!"
          >
            <div className="flex-1! overflow-y-auto! overscroll-contain! px-5! pt-3! pb-6! sm:px-8!">
              <nav aria-label="Main navigation">
                {CATEGORIES.map((cat) => {
                  const open = openMobileSection === cat;
                  return (
                    <motion.div key={cat} variants={menuItem} className="border-b! border-solid! border-[#f2f4f7]!">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenMobileSection(open ? null : cat)}
                        className="group/row flex! h-[72px]! w-full! cursor-pointer! items-center! justify-between! border-0! bg-transparent! p-0! text-left!"
                      >
                        <span className={`text-[28px]! font-semibold! tracking-[-0.03em]! transition-colors! duration-200! ${open ? "text-[#27427f]!" : "text-[#101828]!"}`}>
                          {cat}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`inline-flex! h-9! w-9! items-center! justify-center! rounded-full! border! border-solid! transition-[background-color,border-color,color,transform]! duration-300! ease-[cubic-bezier(0.23,1,0.32,1)]! ${
                            open
                              ? "rotate-45! border-[#27427f]! bg-[#27427f]! text-white!"
                              : "border-[#e4e7ec]! bg-white! text-[#101828]!"
                          }`}
                        >
                          <Plus size={17} strokeWidth={2.25} />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden!"
                          >
                            <ul className="m-0! grid! list-none! grid-cols-2! gap-x-4! p-0! pb-5!">
                              {getLinks(cat).map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className="group/ml flex! items-center! gap-2.5! py-2.5! text-[15px]! font-medium! leading-tight! text-[#475467]! no-underline! transition-colors! hover:text-[#101828]!"
                                  >
                                    <span className="inline-flex! shrink-0! text-[#27427f]! opacity-60! transition-opacity! duration-150! group-hover/ml:opacity-100!">
                                      {link.icon}
                                    </span>
                                    {link.text}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                <motion.div variants={menuItem} className="border-b! border-solid! border-[#f2f4f7]!">
                  <Link
                    href="/contact-us"
                    onClick={closeMobileMenu}
                    className="flex! h-[72px]! items-center! text-[28px]! font-semibold! tracking-[-0.03em]! text-[#101828]! no-underline!"
                  >
                    Contact
                  </Link>
                </motion.div>
              </nav>
            </div>

            {/* Utilities, pinned: city and account in one soft panel, then the CTA */}
            <motion.div
              variants={menuItem}
              className="shrink-0! border-t! border-solid! border-[#f2f4f7]! bg-white! px-5! pt-4! pb-[max(20px,env(safe-area-inset-bottom))]! sm:px-8!"
            >
              <div className="overflow-hidden! rounded-2xl! bg-[#f6f7f9]!">
                <button
                  type="button"
                  onClick={() => setIsMobileCityOpen((v) => !v)}
                  aria-expanded={isMobileCityOpen}
                  className="flex! w-full! cursor-pointer! items-center! gap-3! border-0! bg-transparent! px-4! py-3! text-left!"
                >
                  <span className="inline-flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-full! bg-white! text-[#27427f]! shadow-[0_1px_2px_rgba(16,24,40,0.06)]!">
                    <MapPin size={17} strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0! flex-1!">
                    <span className="block! text-[12px]! font-medium! text-[#667085]!">Location</span>
                    <span className="block! truncate! text-[15px]! font-semibold! text-[#101828]!">{location || "Select city"}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0! text-[#98a2b3]! transition-transform! duration-200! ${isMobileCityOpen ? "rotate-180!" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isMobileCityOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.26, ease: EASE }}
                      className="overflow-hidden!"
                    >
                      <div className="mx-2! mb-2! max-h-[30vh]! overflow-y-auto! rounded-xl! bg-white! p-1.5!">
                        <button
                          type="button"
                          onClick={(e) => {
                            setIsMobileCityOpen(false);
                            detectLocation(e);
                          }}
                          className="flex! w-full! cursor-pointer! items-center! gap-3! rounded-xl! border-0! bg-transparent! px-3! py-2.5! text-left! text-[14px]! font-semibold! text-[#27427f]! hover:bg-[#f5f8ff]!"
                        >
                          <LocateFixed size={16} strokeWidth={2.25} /> Use my current location
                        </button>
                        <div role="listbox" aria-label="City" className="grid! gap-0.5!">
                          {renderCityRows(() => setIsMobileCityOpen(false))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mx-4! h-px! bg-[#eaecf0]!" />

                {isAuthenticated ? (
                  <div className="flex! items-center! gap-3! px-4! py-3!">
                    <DefaultAvatar size={36} />
                    <span className="min-w-0! flex-1!">
                      <span className="block! truncate! text-[15px]! font-semibold! text-[#101828]!">{displayName}</span>
                      <Link
                        href="/wishlist"
                        onClick={closeMobileMenu}
                        className="text-[13px]! font-medium! text-[#27427f]! no-underline!"
                      >
                        Saved properties{wishlistCount > 0 ? ` · ${wishlistCount}` : ""}
                      </Link>
                    </span>
                    <button
                      type="button"
                      onClick={() => logout()}
                      aria-label="Log out"
                      className="inline-flex! h-9! w-9! cursor-pointer! items-center! justify-center! rounded-full! border-0! bg-white! text-[#667085]! shadow-[0_1px_2px_rgba(16,24,40,0.06)]! hover:text-[#d92d20]!"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      setIsAuthModalOpen(true);
                    }}
                    className="flex! w-full! cursor-pointer! items-center! gap-3! border-0! bg-transparent! px-4! py-3! text-left!"
                  >
                    <span className="inline-flex! h-9! w-9! shrink-0! items-center! justify-center! rounded-full! bg-white! text-[#27427f]! shadow-[0_1px_2px_rgba(16,24,40,0.06)]!">
                      <UserRound size={17} strokeWidth={2.25} />
                    </span>
                    <span className="min-w-0! flex-1!">
                      <span className="block! text-[15px]! font-semibold! text-[#101828]!">Sign in</span>
                      <span className="block! text-[12px]! font-medium! text-[#667085]!">Save properties and track enquiries</span>
                    </span>
                  </button>
                )}
              </div>

              <div className="relative! mt-4!">
                <Link
                  href="/post-property"
                  aria-label="Post Property, free"
                  onClick={(e) => {
                    handleProtectedRoute(e);
                    closeMobileMenu();
                  }}
                  className={`${POST_PROPERTY_BUTTON} h-14! w-full! text-[16px]!`}
                >
                  <PostPropertyHover />
                  Post Property
                </Link>
                <FreeBadge />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <UserAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
