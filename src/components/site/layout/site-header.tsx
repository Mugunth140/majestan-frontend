"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Menu, X, ChevronDown, Building, House, Map, Palmtree, Store, Factory, Laptop, ListChecks, FileSignature, Handshake, CircleDollarSign, Globe, Bolt } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const detectLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const detectedCity = data.address.city || data.address.town || data.address.village || "Coimbatore";
          setLocation(detectedCity);
        } catch (error) {
          console.error("Error fetching city:", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Geolocation error:", error);
      }
    );
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
        className={`migrated-site-header ${isScrolled ? "migrated-site-header--scrolled" : ""}`}
      >
        <div className="msh-container">
          <div className="msh-bar">
            {/* Logo */}
            <Link href="/" className="msh-logo">
              <img 
                src="/assets/images/logo/logo.png" 
                alt="Majestan Realty" 
                className="msh-logo-img"
              />
            </Link>

            {/* Navigation - Centered via Flex */}
            <nav className="msh-nav" aria-label="Main navigation">
              <ul className="msh-nav-list">
                {(["Buy", "Rent", "Services"] as const).map((cat) => (
                  <li 
                    key={cat}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="msh-nav-item"
                  >
                    <button className={`msh-nav-button ${hoveredCategory === cat ? "msh-nav-button--active" : ""}`}>
                      {cat} <ChevronDown size={14} className={`msh-chevron ${hoveredCategory === cat ? "msh-chevron--open" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {hoveredCategory === cat && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, x: "-50%" }}
                          animate={{ opacity: 1, y: 0, x: "-50%" }}
                          exit={{ opacity: 0, y: 10, x: "-50%" }}
                          className="msh-mega"
                        >
                          <div className="msh-mega-card">
                            <div className="msh-mega-links">
                              <h6 className="msh-mega-title">
                                {cat === "Services" ? "Expertise" : "Property Types"}
                              </h6>
                              <div className="msh-mega-grid">
                                {getLinks(cat).map((link) => (
                                  <Link key={link.href} href={link.href} className="msh-mega-link">
                                    <span className="msh-mega-link-icon">{link.icon}</span>
                                    <span>{link.text}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <div className="msh-feature">
                              <Bolt size={32} className="msh-feature-icon" />
                              <p>{getFeatured(cat)?.title}</p>
                              <Link href={getFeatured(cat)?.href || "#"} className="msh-feature-link">
                                {getFeatured(cat)?.btn}
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
                <li><Link href="/contact-us" className="msh-contact-link">Contact</Link></li>
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="msh-actions">
              {/* Location */}
              <button 
                onClick={detectLocation}
                className="msh-location"
              >
                <MapPin size={16} className={isLocating ? "msh-pin msh-pin--locating" : "msh-pin"} />
                <span>{location}</span>
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="msh-wishlist" aria-label="Wishlist">
                <Heart size={20} className={wishlistCount > 0 ? "msh-wishlist-icon--active" : ""} />
                {wishlistCount > 0 && (
                  <span className="msh-wishlist-count">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Auth Links */}
              <div className="msh-auth">
                <a href="#modalLogin" data-bs-toggle="modal">Login</a>
                <span className="msh-auth-divider">|</span>
                <a href="#modalRegister" data-bs-toggle="modal">Register</a>
              </div>

              {/* Post Property */}
              <Link href="/rent-or-sell-your-property" className="msh-post">
                Post Property
              </Link>

              {/* Mobile Toggle */}
              <button 
                className="msh-mobile-toggle" 
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="msh-mobile-backdrop"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="msh-mobile-drawer"
            >
              <div className="msh-mobile-head">
                <img src="/assets/images/logo/logo.png" alt="Majestan" className="msh-mobile-logo" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="msh-mobile-close" aria-label="Close navigation menu"><X size={20} /></button>
              </div>

              <div className="msh-mobile-sections">
                {(["Buy", "Rent", "Services"] as const).map((cat) => (
                  <div key={cat} className="msh-mobile-section">
                    <h6>{cat}</h6>
                    <div className="msh-mobile-link-list">
                      {getLinks(cat).slice(0, 4).map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="msh-mobile-link">
                          {link.icon} {link.text}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="msh-mobile-footer">
                  <Link href="/rent-or-sell-your-property" onClick={() => setIsMobileMenuOpen(false)} className="msh-mobile-post">
                    Post Property
                  </Link>
                  <div className="msh-mobile-auth">
                    <a href="#modalLogin" data-bs-toggle="modal">Login</a>
                    <span className="msh-mobile-auth-divider">|</span>
                    <a href="#modalRegister" data-bs-toggle="modal">Register</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
