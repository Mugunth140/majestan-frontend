"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Heart, Menu, X, ChevronDown, Building, House, Map, Palmtree, Store, Factory, Laptop, ListChecks, FileSignature, Handshake, CircleDollarSign, Globe, Bolt, UserRound } from "lucide-react";
import Image from "next/image";

const city = "coimbatore";

type MegaMenuLink = {
  text: string;
  href: string;
  icon: React.ReactNode;
};

const BUY_LINKS: MegaMenuLink[] = [
  { text: "Apartments", href: `/buy-apartments-${city}`, icon: <Building size={18} /> },
  { text: "Villas", href: `/buy-villas-${city}`, icon: <House size={18} /> },
  { text: "Independent Houses", href: `/buy-independent-houses-${city}`, icon: <House size={18} /> },
  { text: "Plots", href: `/buy-plots-${city}`, icon: <Map size={18} /> },
  { text: "Farmlands", href: `/buy-farmlands-${city}`, icon: <Palmtree size={18} /> },
  { text: "Commercial Spaces", href: `/buy-commercial-space-${city}`, icon: <Store size={18} /> },
  { text: "Industrials", href: `/buy-industrials-${city}`, icon: <Factory size={18} /> },
];

const RENT_LINKS: MegaMenuLink[] = [
  { text: "Commercial", href: `/rent-commercial-space-${city}`, icon: <Store size={18} /> },
  { text: "Industrial", href: `/rent-industrials-${city}`, icon: <Factory size={18} /> },
  { text: "Apartment", href: `/rent-apartments-${city}`, icon: <Building size={18} /> },
  { text: "Villa", href: `/rent-villas-${city}`, icon: <House size={18} /> },
  { text: "Independent House", href: `/rent-independent-houses-${city}`, icon: <House size={18} /> },
  { text: "Co-Working", href: `/rent-co-working-${city}`, icon: <Laptop size={18} /> },
];

const SERVICE_LINKS: MegaMenuLink[] = [
  { text: "Property Management", href: "/services/property-management", icon: <ListChecks size={18} /> },
  { text: "Liaisoning Service", href: "/services/liaisoning", icon: <FileSignature size={18} /> },
  { text: "Brokerage Service", href: "/services/professional-brokerage-services", icon: <Handshake size={18} /> },
  { text: "Financial Assistance", href: "/services/financial-assistance", icon: <CircleDollarSign size={18} /> },
  { text: "NRI Services", href: "/services/nri-property-investment", icon: <Globe size={18} /> },
];

type Category = "Buy" | "Rent" | "Services" | null;

export function SiteHeader(): React.JSX.Element {
  const [hoveredCategory, setHoveredCategory] = useState<Category>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [location, setLocation] = useState("Coimbatore");
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<MegaMenuLink | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const updateCount = async () => {
      try {
        const res = await fetch('/Apartment/get_wishlist_count');
        const data = await res.json();
        if (data.success) setWishlistCount(data.cart_count);
      } catch {}
    };
    updateCount();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const detectLocation = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLocating(true);

    const fallbackToIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.city) {
          setLocation(data.city);
        } else {
          console.warn("Could not determine city from IP fallback.");
        }
      } catch (err) {
        console.error("IP fallback error:", err);
      } finally {
        setIsLocating(false);
      }
    };

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser, using fallback.");
      await fallbackToIP();
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const detectedCity = data.address.city || data.address.town || data.address.village || "Coimbatore";
            setLocation(detectedCity);
            setIsLocating(false);
          } catch (error) {
            console.error("Error fetching city from coordinates:", error);
            await fallbackToIP();
          }
        },
        async (error) => {
          console.warn(`Geolocation error (${error.code}): ${error.message}. Using fallback.`);
          await fallbackToIP();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } catch (err) {
      console.error("Geolocation API exception:", err);
      await fallbackToIP();
    }
  };

  const getLinks = (cat: Category) => {
    switch (cat) {
      case "Buy": return BUY_LINKS;
      case "Rent": return RENT_LINKS;
      case "Services": return SERVICE_LINKS;
      default: return [];
    }
  };

  const getFeatured = (cat: Category) => {
    if (cat === "Buy") return { title: "Find your dream home", btn: "Explore Buy", href: "/buy-apartments-coimbatore" };
    if (cat === "Rent") return { title: "Verified rental properties", btn: "Browse Rent", href: "/rent-apartments-coimbatore" };
    if (cat === "Services") return { title: "Expert real estate help", btn: "Our Services", href: "/contact-us" };
    return null;
  };

  return (
    <>
      <header
        className={`fixed! left-1/2 z-[1000] w-[min(95vw,1400px)] max-w-[1400px] -translate-x-1/2 rounded-full border border-white/45 bg-white! font-['Lexend',sans-serif] shadow-[0_18px_45px_rgba(22,30,45,0.18)] transition-all duration-300 max-[640px]:w-[calc(100vw-20px)] ${isScrolled ? "top-2 py-2.5! px-2.5!" : "top-4 py-3 max-[640px]:top-2.5"}`}
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
              <Link href="/wishlist" className="inline-flex! relative text-[#27427f] transition-transform hover:scale-110" aria-label="Wishlist">
                <Heart size={23} className={wishlistCount > 0 ? "fill-[#27427f]" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute! -right-2 -top-2 flex! h-4 w-4 items-center! justify-center! rounded-full border border-white bg-[#ffc900] text-[9px]! font-black leading-none text-[#27427f]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Location */}
              <div className="relative hidden! md:block!" onMouseLeave={() => setIsLocationMenuOpen(false)}>
                <button
                  onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                  onMouseEnter={() => setIsLocationMenuOpen(true)}
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
                      className="absolute! right-0 top-full mt-2 w-64 rounded-2xl border border-black/5 bg-white p-3 shadow-[0_15px_35px_rgba(22,30,45,0.15)] z-[1010]"
                    >
                      <button
                        onClick={(e) => {
                          setIsLocationMenuOpen(false);
                          detectLocation(e);
                        }}
                        className="flex! w-full items-center! gap-2.5 rounded-xl border-0 bg-[#27427f]/5 px-3 py-2.5 text-left text-[13px]! font-bold text-[#27427f]! transition-colors hover:bg-[#27427f]/10!"
                      >
                        <MapPin size={16} />
                        Use My Current Location
                      </button>
                      <div className="my-2 border-t border-black/5"></div>
                      <div className="px-2 pb-1 pt-1 text-[11px]! font-bold uppercase tracking-wider text-black/40!">
                        Popular Cities
                      </div>
                      <div className="grid! gap-1">
                        {["Coimbatore", "Chennai", "Bangalore", "Hyderabad", "Kochi"].map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setLocation(city);
                              setIsLocationMenuOpen(false);
                            }}
                            className={`flex! w-full items-center! rounded-lg border-0 px-3 py-2 text-left text-[13px]! font-semibold! transition-colors hover:bg-[#27427f]/5! ${
                              location === city ? "text-[#27427f]! bg-[#27427f]/5!" : "text-black/70! bg-transparent!"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Post Property */}
              <Link
                href="/rent-or-sell-your-property"
                className="hidden! items-center! gap-2 rounded-full bg-[#ffc900] px-3 py-3 text-[13px]! font-bold! text-black/80! leading-none no-underline transition-all hover:-translate-y-px hover:bg-[#27427f] hover:text-white! lg:inline-flex!"
              >
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
              className="absolute! top-full left-1/2 z-[1002] w-[min(920px,88vw)] pt-2.5!"
            >
              <div className="flex! gap-9 rounded-[28px] border border-black/5 bg-white p-6! shadow-[0_22px_55px_rgba(22,30,45,0.20)]">
                <div className="flex-1">
                  <div className="mb-[18px] border-b border-[#ffc900]/30 pb-3.5">
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
                      {hoveredLink ? React.cloneElement(hoveredLink.icon as React.ReactElement<any>, { size: 32 }) : <Bolt size={32} />}
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
              className="fixed! top-0 right-0 bottom-0 z-[1101] w-full max-w-full bg-white shadow-[-18px_0_45px_rgba(22,30,45,0.20)] flex flex-col"
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
                </div>
              </div>

              {/* Bottom CTAs — pinned */}
              <div className="shrink-0 border-t border-[#27427f]/10 px-5 py-4 grid gap-3">
                <Link
                  href="/rent-or-sell-your-property"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full rounded-xl bg-[#ffc900] py-3 text-[13px]! font-semibold! leading-none tracking-[0.12em] text-[#27427f] uppercase no-underline text-center transition-colors hover:bg-[#27427f] hover:text-white"
                >
                  Post Property
                </Link>
                <div className="flex! items-center! justify-center! gap-2.5 rounded-full bg-[#27427f]/5 px-3 py-2.5! text-[13px]! font-semibold! tracking-[0.08em] text-[#27427f] uppercase">
                  <UserRound size={15} />
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[#27427f] no-underline">Login</Link>
                  <span className="text-[#27427f]/30">/</span>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-[#27427f] no-underline">Register</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
