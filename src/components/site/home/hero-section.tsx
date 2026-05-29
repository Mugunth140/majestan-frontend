"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Home as HomeIcon, Key, TrendingUp } from "lucide-react";
import { HomeSearch } from "./home-search";
import type { Sublocation, UnitType } from "@/lib/api";
import Image from "next/image";

const propertyCategories = [
  ["Apartment", "/property/apartment", "/assets/icons/properties/apartment.png"],
  ["Villa", "/property/villa", "/assets/icons/properties/villas.png"],
  ["Independent House", "/property/independent-house", "/assets/icons/properties/house.png"],
  ["Plots", "/property/plots", "/assets/icons/properties/plot.png"],
  ["Commercial Space", "/property/commercial", "/assets/icons/properties/commercial.png"],
  ["Industrial", "/property/industrial", "/assets/icons/properties/industrial.png"],
  ["Farmland", "/property/farmland", "/assets/icons/properties/farm-land.png"],
  ["Co-Working", "/property/coworking", "/assets/icons/properties/co-living.png"],
] as const;

const TAGLINES = [
  { id: 0, text: "Buy Your Dream Home", Icon: HomeIcon },
  { id: 1, text: "Rent Premium Spaces", Icon: Key },
  { id: 2, text: "Sell with Confidence", Icon: TrendingUp },
] as const;

interface HeroSectionProps {
  sublocations: Sublocation[];
  unitTypes: UnitType[];
}

export function HeroSection({ sublocations, unitTypes }: HeroSectionProps) {
  const [city, setCity] = useState("Coimbatore");
  const [activeIdx, setActiveIdx] = useState(0);

  /* ── Cycle taglines ─────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(
      () => setActiveIdx((i) => (i + 1) % TAGLINES.length),
      3000
    );
    return () => clearInterval(id);
  }, []);

  /* ── Sync city label with stored location ───────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("majestan-location");
    if (stored) setCity(stored);

    const handleLocationChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (typeof customEvent.detail === "string" && customEvent.detail.trim()) {
        setCity(customEvent.detail);
      }
    };

    window.addEventListener("majestan-location-changed", handleLocationChange);
    return () => window.removeEventListener("majestan-location-changed", handleLocationChange);
  }, []);

  const { Icon: ActiveIcon } = TAGLINES[activeIdx];

  const taglineContainerVariants = {
    hidden: { opacity: 0, y: 44 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const, stiffness: 100, damping: 10,
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    },
    exit: { opacity: 0, y: -44, transition: { duration: 0.2 } }
  };

  const taglineWordVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, damping: 10, stiffness: 100 } 
    }
  };

  const taglineIconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-x-hidden bg-white">

      {/* ── Hero background image (responsive) ─────────────────── */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/assets/images/hero/hero_mobile.webp" />
        <img
          src="/assets/images/hero/hero_desktop1.png"
          alt="Majestan Realty — Properties"
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          fetchPriority="high"
          loading="eager"
        />
      </picture>

      {/* ── Gradient overlay — (bottom-to-top) ──────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 25%,rgba(255,255,255,0.5) 40%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 tf-container flex flex-col items-center justify-center text-center w-full px-4 mt-20 md:mt-12">

        {/* H1 */}
        <h1
          className="font-['Lexend',sans-serif] text-[#0a0a0a] leading-[1.06] tracking-[-0.02em] mb-6 drop-shadow-sm"
          style={{ fontSize: "clamp(30px, 4.4vw, 62px)", fontWeight: 300 }}
        >
          Your Trusted Real Estate Partner
          <br className="hidden md:block!" /> in{" "}
          <span className="text-[#27427f] font-semibold">{city}</span>
        </h1>

        {/* Animated tagline block */}
        <div className="mb-10 max-[640px]:mb-8 flex flex-col items-center w-full">
          {/* Fixed-height row — prevents layout shift */}
          <div
            className="flex items-center justify-center gap-3 overflow-hidden"
            style={{ height: "clamp(36px, 4vw, 50px)" }}
          >
            {/* Gold accent bar */}
            <div className="w-[4px] h-9 rounded-full bg-[#ffc900] shrink-0 max-[640px]:h-7 hidden sm:block" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={taglineContainerVariants}
                className="flex items-center justify-center gap-2.5"
              >
                <motion.div variants={taglineIconVariants}>
                  <ActiveIcon
                    size={22}
                    className="text-[#27427f] shrink-0 max-[640px]:hidden"
                    strokeWidth={2.5}
                  />
                </motion.div>
                <div
                  className="font-['Lexend',sans-serif] font-semibold text-[#27427f] whitespace-nowrap drop-shadow-sm flex"
                  style={{ fontSize: "clamp(17px, 1.9vw, 25px)" }}
                >
                  {TAGLINES[activeIdx].text.split(" ").map((word) => (
                    <motion.span
                      key={word}
                      variants={taglineWordVariants}
                      className="inline-block mr-[0.25em]"
                      style={{ willChange: "transform, opacity" }}
                    >
                      {word}{"\u00a0"}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress pill indicators */}
          {/* <div className="flex items-center justify-center gap-[7px] mt-4">
            {TAGLINES.map(({ id, text }, i) => (
              <button
                key={id}
                onClick={() => setActiveIdx(i)}
                aria-label={`Show: ${text}`}
                className={`h-[5px] rounded-full border-0 p-0 transition-all duration-500 cursor-pointer ${i === activeIdx
                    ? "w-8 bg-[#27427f]"
                    : "w-[5px] bg-[#27427f]/25 hover:bg-[#27427f]/45"
                  }`}
              />
            ))}
          </div> */}
        </div>

        {/* Search bar */}
        <div className="w-full">
          <HomeSearch sublocations={sublocations} unitTypes={unitTypes} />
        </div>

        {/* Quick Links */}
        <motion.div 
          className="grid grid-cols-4 sm:hidden md:flex justsm:flex-wrapify-center justify-around items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-4xl mx-auto h-25 mt-12!"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {propertyCategories.map(([title, href, iconSource]) => (
            <Link 
              key={title} 
              href={href}
              className="group flex flex-col items-center justify-center bg-white rounded-xl p-1.5 size-23 aspect-square shadow-sm hover:shadow-md ring-1 ring-black/5 transition-all hover:bg-[#27427f]! hover:-translate-y-1"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 mb-1.5 sm:mb-2 opacity-85 group-hover:opacity-100 group-hover:scale-110 group-hover:text-white! transition-all flex items-center justify-center">
              <Image src={iconSource} alt={title} width={38} height={38} className="w-full h-full object-contain" />
              </div>
              <span className="text-center text-[#27427f] font-normal font-['Lexend',sans-serif] text-sm! leading-tight px-0.5 group-hover:text-white!">
                {title}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
