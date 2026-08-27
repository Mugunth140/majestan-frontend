"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Heart, Menu, X, ChevronDown, Building, House, Map, Palmtree, Store, Factory, Laptop, ListChecks, FileSignature, Handshake, CircleDollarSign, Globe, Bolt, UserRound, Phone } from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { LogOut } from "lucide-react";
import { useLocationContext } from "@/contexts/LocationContext";
import Image from "next/image";
import { toLocationSlug } from "@/lib/seo-urls";

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
  const [hoveredCategory, setHoveredCategory] = useState<Category>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<MegaMenuLink | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLocationMenuOpen) {
      timeoutId = setTimeout(() => {
        setIsLocationMenuOpen(false);
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLocationMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const controller = new AbortController();
    const updateCount = async () => {
      try {
        const res = await fetch('/Apartment/get_wishlist_count', { signal: controller.signal });
        const data = await res.json();
        if (data.success) setWishlistCount(data.cart_count);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    };
    updateCount();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      controller.abort();
    };
  }, []);


  const handleProtectedRoute = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };
  const detectLocation = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateLocation();
  };

  const getLinks = (cat: Category) => {
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
      case "Services": return SERVICE_LINKS;
      default: return [];
    }
  };

  const getFeatured = (cat: Category) => {
    const citySlug = toLocationSlug(location);
    if (cat === "Buy") return { title: "Find your dream home", btn: "Explore Buy", href: `/for-sale/apartments/${citySlug}` };
    if (cat === "Rent") return { title: "Verified rental properties", btn: "Browse Rent", href: `/for-rent/apartments/${citySlug}` };
    if (cat === "Services") return { title: "Expert real estate help", btn: "Our Services", href: "/contact-us" };
    return null;
  };

  return (
    <>
      <header
        className={`fixed! left-1/2 z-[1000] -translate-x-1/2 border border-white/30! bg-white/45! backdrop-blur-xs! font-['Lexend',sans-serif] transition-all duration-350 ${isScrolled ? "top-0! w-full! max-w-full! rounded-none! py-2.5! px-5! shadow-[0_10px_30px_rgba(22,30,45,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]!" : "top-4! w-[min(95vw,1400px)]! max-w-[1400px]! rounded-full! py-3! shadow-[0_18px_45px_rgba(22,30,45,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]! max-[640px]:top-2.5! max-[640px]:w-[calc(100vw-20px)]!"}`}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="w-full px-5 max-[640px]:px-3!">
          <div className="flex! min-h-11 items-center! justify-between! gap-3 max-[1024px]:gap-2">
            {/* Logo */}
            <Link href="/" className="inline-flex! shrink-0 transition-transform active:scale-95" aria-label="Majestan Realty Home">
              <img
                src="/assets/images/logo/logo.png"
                alt="Majestan Realty"
                className={`w-auto! object-contain transition-all duration-300 max-[1180px]:h-[38px]! max-[900px]:h-8! max-[640px]:h-7! max-[640px]:max-w-[180px]! ${isScrolled ? "h-9!" : "h-10!"}`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden! flex-1 justify-center! lg:flex!" aria-label="Main navigation">
              <ul className="flex! items-center! gap-1.5 p-0">
                {(["Buy", "Rent", "Services"] as const).map((cat) => (
                  <li
                    key={cat}
                    onMouseEnter={() => {
                      setHoveredCategory(cat);
                      setHoveredLink(null);
                    }}
                    className="relative"
                  >
                    <button className={`inline-flex! items-center! gap-1.5 rounded-full border-0 bg-transparent px-4 py-2 text-[14px] font-bold text-black/80! leading-none no-underline transition-colors hover:bg-[#27427f]/5 hover:text-[#ffc900] max-[1180px]:px-3 ${hoveredCategory === cat ? "bg-[#27427f]/10 text-[#ffc900]" : ""}`}>
                      {cat} <ChevronDown size={14} className={`transition-transform duration-200 ${hoveredCategory === cat ? "rotate-180" : ""}`} />
                    </button>
                  </li>
                ))}
                <li>
                  <Link href="/contact-us" className="inline-flex! rounded-full! px-4 py-2 text-[14px] font-bold leading-none text-black/80! no-underline transition-colors hover:bg-[#27427f]/5 hover:text-[#ffc900] max-[1180px]:px-3">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex! shrink-0 items-center! justify-end! gap-3 max-[1180px]:gap-2.5 max-[1024px]:gap-2">
              {/* Wishlist */}
              <Link href="/wishlist" className="inline-flex! relative text-[#27427f] transition-transform hover:scale-110" aria-label="Wishlist" onClick={(e) => handleProtectedRoute(e, "/wishlist")}>
                <Heart size={23} className={wishlistCount > 0 ? "fill-[#27427f]" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute! -right-2 -top-2 flex! h-4 w-4 items-center! justify-center! rounded-full border border-white bg-[#ffc900] text-[9px]! font-black leading-none text-[#27427f]">
                    {wishlistCount}
                  </span>
                )}
              </Link>


              {/* Account */}
              <div className="relative group">
                <button 
                  onClick={() => !isAuthenticated ? setIsAuthModalOpen(true) : undefined}
                  className="inline-flex! items-center! justify-center! h-[42px]! w-[42px]! rounded-full! border-0 bg-[#27427f]/5! text-[#27427f] transition-colors hover:bg-[#27427f]/10!"
                  aria-label="Account"
                >
                  <UserRound size={20} />
                </button>
                {isAuthenticated && (
                  <div className="absolute! right-0! top-full! mt-2! w-56! rounded-2xl! bg-white! shadow-[0_10px_40px_rgba(0,0,0,0.08)]! border! border-gray-100! opacity-0! invisible! group-hover:opacity-100! group-hover:visible! transition-all! overflow-hidden! z-[1010]!">
                    <div className="p-2!">
                      <div className="px-3! py-2.5! mb-1! border-b! border-gray-100!">
                        <p className="text-[11px]! font-bold! text-gray-400! uppercase! tracking-wider! mb-0.5!">Signed in as</p>
                        <p className="text-[13px]! font-semibold! text-[#27427f]! truncate!">{user?.phone || user?.email}</p>
                      </div>
                      <button onClick={() => logout()} className="flex! w-full! items-center! gap-3! rounded-xl! px-3! py-2.5! text-[13px]! font-medium! text-rose-600! hover:bg-rose-50! transition-colors!">
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="relative hidden! md:block!">
                <button
                  onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                  className="inline-flex! items-center! gap-2 border-0 bg-[#27427f]/5! px-3 py-3 rounded-full! transition-colors hover:bg-[#27427f]/10!"
                >
                  <MapPin size={16} className={`text-[#27427f] ${isLocating ? "animate-bounce" : ""}`} />
                  <span className="text-[13px]! font-semibold! leading-none text-[#27427f]">{location}</span>
                </button>
                
                <AnimatePresence>
                  {isLocationMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute! right-0 top-full mt-2 w-64 rounded-2xl border border-white/40! bg-white/95! backdrop-blur-2xl! p-3 shadow-[0_15px_35px_rgba(22,30,45,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]! z-[1010]"
                    >
                      <button
                        onClick={(e) => {
                          setIsLocationMenuOpen(false);
                          detectLocation(e);
                        }}
                        className="flex! w-full items-center! gap-2.5 rounded-xl! border-0 bg-[#27427f]/5 px-3 py-2.5 text-left text-[13px]! font-bold text-[#27427f]! transition-colors hover:bg-[#27427f]/10!"
                      >
                        <MapPin size={16} />
                        Use Current Location
                      </button>
                      <div className="my-2 border-t border-black/5"></div>
                      <div className="px-2 pb-1 pt-1 text-[11px]! font-semibold tracking-normal text-black/40!">
                        Available Cities
                      </div>
                      <div className="grid! gap-1">
                        {isLoadingCities && (
                          <p className="m-0 px-3 py-2 text-[13px]! text-black/45">
                            Loading cities...
                          </p>
                        )}
                        {!isLoadingCities && cities.length === 0 && (
                          <p className="m-0 px-3 py-2 text-[13px]! text-black/45">
                            No active cities available
                          </p>
                        )}
                        {cities.map((city) => (
                          <button
                            key={city.id}
                            onClick={() => {
                              setLocation(city.city);
                              setIsLocationMenuOpen(false);
                            }}
                            className={`flex! w-full items-center! rounded-lg! border-0! px-3! py-2! text-left text-[13px]! font-semibold! transition-colors hover:bg-[#27427f]/5! ${
                              location === city.city ? "text-[#27427f]! bg-[#27427f]/5!" : "text-black/70! bg-transparent!"
                            }`}
                          >
                            {city.city}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Post Property */}
              <Link href="/rent-or-sell-your-property"
                className="hidden! items-center! gap-2 rounded-full bg-[#ffc900] px-3 py-3 text-[13px]! font-bold! text-black/80! leading-none no-underline transition-all hover:-translate-y-px hover:bg-[#27427f] hover:text-white! lg:inline-flex!"
               onClick={(e) => { handleProtectedRoute(e, "/rent-or-sell-your-property"); if(isMobileMenuOpen) setIsMobileMenuOpen(false); }}>
                Rent / Sell your Property
              </Link>


              {/* Mobile Toggle */}

              <button
                className="inline-flex! h-12 w-12 items-center! justify-center! rounded-full! border-0 bg-[#27427f]/5! text-[#27427f] transition-colors hover:bg-[#27427f]! lg:hidden!"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        <AnimatePresence>
          {hoveredCategory && (
            <motion.div
              initial={{ opacity: 0, y: 12, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 12, x: "-50%" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute! top-full left-1/2 z-1005 w-[min(920px,88vw)] pt-2.5!"
            >
              <div className="flex! gap-9 rounded-[28px] border p-6! shadow-[0_22px_55px_rgba(22,30,45,0.20),inset_0_1px_0_rgba(255,255,255,0.8)]! border-white/30! bg-white/95! backdrop-blur-xl!">
                <div className="flex-1">
                  <div className="mb-4.5 border-b border-[#ffc900]/30 pb-3.5">
                    <p className="m-0 mb-2 text-[18px]! font-semibold! leading-tight text-[#27427f]!">{getFeatured(hoveredCategory)?.title}</p>
                  </div>
                  <div className="grid! grid-cols-2 gap-1 transition-all duration-200">
                    {getLinks(hoveredCategory).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onMouseEnter={() => setHoveredLink(link)}
                        className="flex! items-center! gap-3.5 rounded-xl p-3 text-[14px]! font-bold leading-tight text-[#27427f]/75 no-underline transition-colors hover:bg-[#27427f]/5 hover:text-[#27427f]"
                      >
                        <span className="inline-flex! shrink-0 text-[#27427f]">{link.icon}</span>
                        <span>{link.text}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex! w-[270px]! shrink-0 flex-col items-center! justify-center! rounded-2xl bg-[#27427f] p-7 text-center text-white relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#27427f,rgba(39,66,127,0.85))] z-0 transition-all duration-300"></div>
                  <div className="relative z-10 flex w-full h-full flex-col items-center justify-center p-2">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full p-4 text-[#ffc900] transition-transform duration-300 group-hover:scale-110">
                      {hoveredLink
                        ? React.cloneElement(
                            hoveredLink.icon as React.ReactElement<{
                              size?: number;
                            }>,
                            { size: 32 },
                          )
                        : <Bolt size={32} />}
                    </div>
                    <h4 className="mb-3 text-[16px]! font-black leading-tight text-white transition-all duration-300">
                      {hoveredLink ? hoveredLink.text : getFeatured(hoveredCategory)?.title}
                    </h4>
                    <p className="mb-6 text-[12px]! font-medium leading-relaxed text-white/70">
                      {hoveredLink
                        ? `Explore the best options in ${hoveredLink.text.toLowerCase()} tailored just for you.`
                        : "Discover top properties in the city."}
                    </p>
                    <Link
                      href={hoveredLink ? hoveredLink.href : (getFeatured(hoveredCategory)?.href || "#")}
                      className="w-full rounded-xl bg-[#ffc900] px-4! py-3.5! text-[12px]! font-black leading-none tracking-[0.08em] text-[#27427f] uppercase no-underline shadow-[0_10px_20px_rgba(39,66,127,0.3)] transition-transform hover:scale-[1.04] hover:shadow-[0_12px_24px_rgba(39,66,127,0.4)]"
                    >
                      {hoveredLink ? `View ${hoveredLink.text}` : getFeatured(hoveredCategory)?.btn}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed! inset-0 z-[1100] bg-[#27427f]/20 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 15 }}
              className="fixed! top-0 right-0 bottom-0 z-[1101] w-full max-w-full bg-white/95! backdrop-blur-2xl! border-l border-white/40! shadow-[-18px_0_45px_rgba(22,30,45,0.20),inset_1px_0_0_rgba(255,255,255,0.8)]! flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex! items-center! justify-between! px-5 py-4 border-b border-[#27427f]/10 shrink-0">
                <Image src="/assets/images/logo/logo.png" alt="Majestan" width={220} height={40} className="" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex! h-12 w-12 items-center! justify-center! rounded-full! border-0 bg-[#27427f]/5! text-[#27427f]!"
                  aria-label="Close navigation menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable nav links */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="grid gap-5">
                  {(["Buy", "Rent", "Services"] as const).map((cat) => (
                    <div key={cat} className="grid gap-1.5">
                      <h6 className="m-0 px-1 text-[14px]! font-semibold! leading-none tracking-[0.5em] text-[#27427f]/45! uppercase">{cat}</h6>
                      <div className="grid! gap-1.5">
                        {getLinks(cat).slice(0, 4).map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex! items-center! gap-3 rounded-xl bg-[#27427f]/5 px-3 py-2.5! text-[13px]! font-bold text-[#27427f]! no-underline"
                          >
                            {link.icon} {link.text}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="grid gap-1.5 border-t border-[#27427f]/10 pt-4">
                    <h6 className="m-0 px-1 text-[12px]! font-semibold! tracking-[0.18em] text-[#27427f]/45! uppercase">
                      City
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {cities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => setLocation(city.city)}
                          className={`rounded-full border px-3 py-2 text-[12px]! font-bold ${
                            location === city.city
                              ? "border-[#27427f] bg-[#27427f] text-white"
                              : "border-[#27427f]/15 bg-[#27427f]/5 text-[#27427f]"
                          }`}
                        >
                          {city.city}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Additional Mobile Links */}
                  <div className="grid gap-1.5 mt-2 border-t border-[#27427f]/10 pt-4">
                    <Link
                      href="/contact-us"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex! items-center! gap-3 rounded-xl bg-[#27427f]/5 px-3 py-2.5! text-[13px]! font-bold text-[#27427f]! no-underline"
                    >
                      <Phone size={16} /> Contact Us
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom CTAs — pinned */}
              <div className="shrink-0 border-t border-[#27427f]/10 px-5 py-4 grid gap-3">
                <Link 
                  href="/rent-or-sell-your-property"
                  onClick={(e) => { handleProtectedRoute(e, "/rent-or-sell-your-property"); if(isMobileMenuOpen) setIsMobileMenuOpen(false); }}
                  className="w-full rounded-xl bg-[#ffc900] py-3 text-[13px]! font-semibold! leading-none tracking-[0.12em] text-[#27427f] uppercase no-underline text-center transition-colors hover:bg-[#27427f] hover:text-white"
                >
                  Post Property
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <UserAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
