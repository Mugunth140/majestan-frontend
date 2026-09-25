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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white">

      {/* ── SEO-only heading (banner artwork carries the visible text) ── */}
      <h1 className="sr-only">Your Trusted Real Estate Partner in {city}</h1>

      {/* ── Hero background: ads banner carousel, static fallback ────── */}
      {banners.length > 0 ? (
        <HeroCarousel banners={banners} citySlug={citySlug} />
      ) : (
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
      )}

      {/* ── Bottom fade into page background ─────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[25%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* ── Content: search bar + category strip ─────────────────────── */}
      <div className="relative z-10 tf-container flex flex-col items-center justify-center text-center w-full px-4 mt-20 md:mt-12">
        <div className="w-full">
          <HomeSearch
            key={city}
            sublocations={sublocations}
            unitTypes={unitTypes}
          />
        </div>

        <div
          className="grid grid-cols-4 sm:hidden md:flex justsm:flex-wrapify-center justify-around items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-4xl mx-auto mt-12!"
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
