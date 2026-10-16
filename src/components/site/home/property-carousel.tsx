"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FeaturedEnquiry, type FeaturedEnquiryRequest } from "./featured-enquiry";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import { type FeaturedProperty, type HomeBanner } from "@/lib/api";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { MapPin, ChevronLeft, ChevronRight, ArrowUpRight, Phone, Tag } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ─────────── types ─────────── */
type PropertyCarouselProps =
  | { properties: FeaturedProperty[]; banners?: never; emptyMessage: string; variant?: "properties" }
  | { banners: HomeBanner[]; properties?: never; emptyMessage: string; variant: "banner" };

/* ─────────── fallback images ───────────
   Per-type local placeholders (public/assets/placeholder). Unsplash
   fallbacks retired — missing/failed photos settle on the type image. */

/* ══════════════════════════════════════════════════════════════════
   ENTRY POINT
══════════════════════════════════════════════════════════════════ */
export function FeatureCarousel(props: PropertyCarouselProps) {
  if (props.variant === "banner") {
    return (
      <Swiper
        modules={[A11y, Autoplay, Navigation, Pagination]}
        pagination={{ clickable: false }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={props.banners.length > 1}
        className="migrated-swiper migrated-banner-swiper"
      >
        {props.banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {banner.href ? (
              <a href={banner.href} target="_blank" rel="noreferrer" className="block w-full">
                <img src={banner.image} alt="Majestan Realty banner" className="w-full! h-auto! object-contain! md:object-cover!" />
              </a>
            ) : (
              <img src={banner.image} alt="Majestan Realty banner" className="w-full! h-auto! object-contain! md:object-cover!" />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }

  if (props.properties.length === 0) {
    return (
      <div className="flex! flex-col! items-center! justify-center! py-20! text-center!">
        <div className="w-14! h-14! rounded-full! bg-[#27427f]/6! flex! items-center! justify-center! mb-3!">
          <MapPin size={22} className="text-[#27427f]/30" strokeWidth={2} />
        </div>
        <p className="text-sm! text-[#27427f]/50! font-medium!">{props.emptyMessage}</p>
      </div>
    );
  }

  return <CurvedPathCarousel properties={props.properties} />;
}

/* ══════════════════════════════════════════════════════════════════
   CURVED PATH CAROUSEL
══════════════════════════════════════════════════════════════════ */
function CurvedPathCarousel({ properties }: { properties: FeaturedProperty[] }) {
  const [enquiry, setEnquiry] = useState<FeaturedEnquiryRequest | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative! w-full! overflow-hidden! py-12!">
      <Swiper
        modules={[A11y, Autoplay, Navigation, Pagination, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={properties.length > 3}
        watchOverflow={true}
        coverflowEffect={{
          rotate: 35,
          stretch: 0,
          depth: 250,
          modifier: 1,
          slideShadows: false,
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full! pb-12!"
      >
        {properties.map((prop, i) => (
          <SwiperSlide key={`${prop.id}-${i}`} style={{ width: "clamp(240px, 28vw, 320px)" }}>
            {({ isActive }) => (
              <CurveCard
                property={prop}
                isActive={isActive}
                photo={prop.photo}
                placeholderSrc={getPlaceholderImage({ propertyType: prop.propertyType })}
                onContact={() => setEnquiry({ property: prop, token: Date.now() })}
              />
            )}
          </SwiperSlide>
        ))}
        
        {/* Minimal Nav Controls */}
        <div className="flex! items-center! justify-center! gap-5! mt-8!">
          <SwiperNavBtn dir="left" />
          
          <div className="flex! items-center! gap-2!">
            {properties.map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  width: i === activeIndex ? 28 : 7,
                  backgroundColor: i === activeIndex ? "#27427f" : "rgba(39,66,127,0.2)",
                }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                style={{ display: "block", height: 7, borderRadius: 999 }}
              />
            ))}
          </div>

          <SwiperNavBtn dir="right" />
        </div>
      </Swiper>

      <FeaturedEnquiry request={enquiry} />
    </div>
  );
}

/* ── swiper nav arrow button ── */
import { useSwiper } from 'swiper/react';

function SwiperNavBtn({ dir }: { dir: "left" | "right" }) {
  const swiper = useSwiper();
  
  return (
    <motion.button
      type="button"
      aria-label={dir === "left" ? "Previous" : "Next"}
      onClick={() => dir === "left" ? swiper.slidePrev() : swiper.slideNext()}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-10! h-10! rounded-full! border! border-[#27427f]/14! bg-white! flex! items-center! justify-center! text-[#27427f]/50! shadow-sm! hover:border-[#27427f]/40! hover:text-[#27427f]! transition-colors! duration-200! z-10!"
    >
      {dir === "left"
        ? <ChevronLeft size={17} strokeWidth={2} />
        : <ChevronRight size={17} strokeWidth={2} />}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CURVE CARD
══════════════════════════════════════════════════════════════════ */
function CurveCard({
  property, isActive, photo, placeholderSrc, onContact,
}: {
  property: FeaturedProperty;
  isActive: boolean;
  photo: string | null;
  placeholderSrc: string;
  onContact: () => void;
}) {
  return (
    <div
      className={`
        relative! overflow-hidden! rounded-[2rem]! w-full!
        border! border-white/10!
        shadow-[0_16px_52px_-12px_rgba(39,66,127,0.18)]!
        transition-all! duration-500! ease-out! cursor-pointer!
        ${isActive ? "shadow-[0_32px_80px_-16px_rgba(39,66,127,0.32)]!" : "opacity-60! scale-95!"}
      `}
      style={{ aspectRatio: "2/3" }}
    >
      {/* photo */}
      <ListingImage
        src={photo}
        placeholderSrc={placeholderSrc}
        alt={property.propertyName ?? "Property"}
        eager={isActive}
        className="absolute! inset-0! w-full! h-full! object-cover! transition-transform! duration-700!"
      />

      {/* ambient gradient — 3 layers for depth */}
      <div className="absolute! inset-0! bg-gradient-to-t! from-[#0a1628]/95! via-[#0a1628]/30! to-[#27427f]/10!" />
      <div className="absolute! inset-0! bg-gradient-to-br! from-white/4! to-transparent!" />

      {/* post-type pill — top left */}
      <div className="absolute! top-4! left-4! z-10!">
        <span className="inline-flex! items-center! gap-1.5! rounded-full! bg-[#ffc900]! px-3! py-1! text-[8px]! font-black! uppercase! tracking-[0.16em]! text-[#27427f]! shadow-md!">
          <Tag size={7} strokeWidth={3} />
          {property.postType}
        </span>
      </div>

      {/* price badge — top right */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.05 }}
          className="absolute! top-4! right-4! z-10!"
        >
          <span className="inline-flex! rounded-full! bg-white/15! backdrop-blur-md! border! border-white/20! shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]! px-3! py-1.5! text-[10px]! font-black! text-white! leading-none!">
            {formatPrice(property)}
          </span>
        </motion.div>
      )}

      {/* bottom content */}
      <div className="absolute! bottom-0! left-0! right-0! p-5!">
        {/* location */}
        <p className="flex! items-center! gap-1.5! text-[9px]! font-bold! uppercase! tracking-wider! text-white/50! mb-2!">
          <MapPin size={9} strokeWidth={2.5} className="text-[#ffc900] shrink-0" />
          {property.sublocation ?? "Coimbatore"}, Coimbatore
        </p>

        {/* property name */}
        <h5 className="text-[15px]! font-bold! text-white! leading-snug! line-clamp-2! tracking-tight! mb-1!">
          {property.propertyName ?? "Featured Property"}
        </h5>

        {/* price row on non-active (smaller) */}
        {!isActive && (
          <span className="text-xs! font-black! text-white/70! leading-none!">
            {formatPrice(property)}
          </span>
        )}

        {/* active CTA row */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.08 }}
              className="flex! items-center! gap-2! mt-4! pt-3.5! border-t! border-white/12!"
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onContact(); }}
                className="flex-1! inline-flex! items-center! justify-center! gap-1.5! rounded-full! bg-white/14! backdrop-blur-sm! border! border-white/18! py-2.5! text-[9px]! font-black! uppercase! tracking-wider! text-white! hover:bg-[#ffc900]! hover:text-[#27427f]! hover:border-[#ffc900]! transition-all! duration-200!"
              >
                <Phone size={9} strokeWidth={2.5} /> Contact
              </button>
              <Link
                href={property.detailPath}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex! items-center! justify-center! w-9! h-9! rounded-full! bg-[#ffc900]! text-[#27427f]! shadow-lg! hover:scale-110! transition-transform! duration-200! shrink-0!"
              >
                <ArrowUpRight size={13} strokeWidth={3} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* inner refraction ring */}
      <div className="absolute! inset-0! rounded-[2rem]! shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]! pointer-events-none!" />
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
   PRICE FORMATTER
══════════════════════════════════════════════════════════════════ */
function formatPrice(p: FeaturedProperty) {
  const raw = p.postType === "Rent" ? p.monthlyRent : p.expectedSalePrice;
  const val = Number(raw);
  if (!Number.isFinite(val) || val <= 0) return "Price on request";
  if (val >= 10_000_000) {
    const cr = Math.floor(val / 10_000_000);
    const lk = Math.floor((val % 10_000_000) / 100_000);
    return `Rs ${cr} Cr${lk > 0 ? ` ${lk} L` : ""}`;
  }
  if (val >= 100_000) return `Rs ${Math.floor(val / 100_000)} L`;
  return `Rs ${val.toLocaleString("en-IN")}`;
}
