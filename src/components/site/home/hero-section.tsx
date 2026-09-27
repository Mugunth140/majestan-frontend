"use client";

import Link from "next/link";
import { HomeSearch } from "./home-search";
import { HeroCarousel } from "./hero-carousel";
import type { AdHeroBanner } from "@/lib/ads";
import type { Sublocation, UnitType } from "@/lib/api";
import Image from "next/image";
import { useLocationContext } from "@/contexts/LocationContext";
import { toLocationSlug } from "@/lib/seo-urls";

interface HeroSectionProps {
  sublocations: Sublocation[];
  unitTypes: UnitType[];
  banners?: AdHeroBanner[];
}

export function HeroSection({ sublocations, unitTypes, banners = [] }: HeroSectionProps) {
  const { location: city } = useLocationContext();
  const citySlug = toLocationSlug(city);
  const propertyCategories = [
    ["Apartment", `/for-sale/apartments/${citySlug}`, "/assets/icons/properties/apartment.png"],
    ["Villa", `/for-sale/villas/${citySlug}`, "/assets/icons/properties/villas.png"],
    ["Independent House", `/for-sale/independent-houses/${citySlug}`, "/assets/icons/properties/house.png"],
    ["Plots", `/for-sale/plots/${citySlug}`, "/assets/icons/properties/plot.png"],
    ["Commercial Space", `/for-sale/commercial-spaces/${citySlug}`, "/assets/icons/properties/commercial.png"],
    ["Industrial", `/for-sale/industrial-spaces/${citySlug}`, "/assets/icons/properties/industrial.png"],
    ["Farmland", `/for-sale/farmlands/${citySlug}`, "/assets/icons/properties/farm-land.png"],
    ["Co-Working", `/for-rent/coworking/${citySlug}`, "/assets/icons/properties/co-living.png"],
  ] as const;

  return (
    <section className="relative overflow-hidden bg-white">

      {/* ── SEO-only heading (banner artwork carries the visible text) ── */}
      <h1 className="sr-only">Your Trusted Real Estate Partner in {city}</h1>

      {/* ── Banner carousel at the exact ad aspect ratio ─────────────── */}
      {banners.length > 0 ? (
        <HeroCarousel banners={banners} citySlug={citySlug} />
      ) : (
        <div className="relative w-full aspect-[4/5] md:aspect-[32/9] overflow-hidden bg-white">
          <picture>
            <source media="(max-width: 767px)" srcSet="/assets/images/hero/hero_mobile.png" />
            <img
              src="/assets/images/hero/hero_desktop.png"
              alt="Majestan Realty — Properties"
              className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
              fetchPriority="high"
              loading="eager"
            />
          </picture>
        </div>
      )}

      {/* ── Search bar + category strip ──────────────────────────────── */}
      {/*
        Pull the search card up so it slightly overlaps the bottom edge of the
        banner. Two things about this app's CSS matter here:
          1. `!` is mandatory. public/assets/css/styles.css + sib-styles.css are
             loaded as unlayered <link> styles in layout.tsx, and unlayered rules
             beat Tailwind's @layer utilities regardless of source order — without
             `!` a margin utility here computes to 0px (the old py-8/md:py-10 on
             this very element was dead for exactly that reason).
          2. --spacing is 3.5px, not 4px, because styles.css:171 sets
             body { font-size: 14px }. So mt-6! = 21px and mt-16! = 56px.
        HomeSearch carries its own mt-6!, so the net overlap is 56 - 21 = 35px on
        desktop and 21 - 21 = 0px on mobile: the 4:5 mobile creative has its
        headline baked into the bottom of the artwork, and dragging the card over
        it there would hide the ad copy.
      */}
      <div className="tf-container relative z-20 flex flex-col items-center justify-center text-center w-full px-4 -mt-6! md:-mt-16!">
        <div className="w-full">
          <HomeSearch
            key={city}
            sublocations={sublocations}
            unitTypes={unitTypes}
          />
        </div>

        <div
          className="grid grid-cols-4 sm:hidden md:flex justsm:flex-wrapify-center justify-around items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-4xl mx-auto mt-8 md:mt-10"
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
        </div>
      </div>
    </section>
  );
}
