"use client";

import { usableArea } from "@/lib/seo-quality";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { FeaturedEnquiry, type FeaturedEnquiryRequest } from "./featured-enquiry";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { type FeaturedProperty } from "@/lib/api";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { MapPin, ChevronLeft, ChevronRight, BedDouble, Ruler } from "lucide-react";

import { FacingArrow } from "./facing-arrow";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ─────────── fallback images ───────────
   Per-type local placeholders (public/assets/placeholder). Unsplash
   fallbacks retired — missing/failed photos settle on the type image. */

type LuxuryFeaturedSectionProps = {
  properties: FeaturedProperty[];
  title: string;
  subtitle: string;
};

export function LuxuryFeaturedSection({ properties, title, subtitle }: LuxuryFeaturedSectionProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [enquiry, setEnquiry] = useState<FeaturedEnquiryRequest | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!properties || properties.length === 0) return null;

  return (
    <section className="relative! w-full! py-15! bg-white! overflow-hidden!">
      {/* Mobile: gutters live on the header only, so the carousel track runs
          edge-to-edge and a single slide can use the full screen width. */}
      <div className="relative! w-full! max-w-[1400px]! mx-auto! px-0! sm:px-6! md:px-8! z-10!">
        {/* Section Header */}
        <div className="flex! flex-col! md:flex-row! justify-between! items-start! md:items-end! mb-12! px-4! sm:px-0!">
          <div className="max-w-2xl!">
            {/* <span className="block! text-[#27427f]! text-xs! font-bold! uppercase! tracking-[0.2em]! mb-3!">
              FEATURED PROJECTS
            </span> */}
            <h2 className="font-['Lexend',sans-serif]! text-[#0a0a0a]! leading-[1.1]! tracking-[-0.02em]! drop-shadow-sm! font-light! text-[clamp(30px,4vw,50px)]! mb-4!">
              {title}
            </h2>
            <p className="text-gray-500! text-base!">
              {subtitle}
            </p>
          </div>

          {/* Navigation Arrows (Top Right) - only when swiper is active */}
          {properties.length >= 4 && (
          <div className="hidden! md:flex! items-center! gap-3! mt-6! md:mt-0!">
            <button 
              onClick={() => swiperInstance?.slidePrev()}
              className="w-12! h-12! rounded-full! border! border-[#27427f]! text-[#27427f]! flex! items-center! justify-center! transition-all! duration-300! hover:bg-[#27427f]! hover:text-white!"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => swiperInstance?.slideNext()}
              className="w-12! h-12! rounded-full! border! border-[#27427f]! text-[#27427f]! flex! items-center! justify-center! transition-all! duration-300! hover:bg-[#27427f]! hover:text-white!"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          )}
        </div>

        {/* Carousel — static centered grid for 1-3 items, infinite 4-in-row swiper for 4+ */}
        {/* Carousel — static centered grid for 1-3 items, infinite 4-in-row swiper for 4+.
            Mobile keeps a 16px inset so cards do not touch the screen edge, but no
            max-width, so a single slide spans the full viewport. */}
        <div className="relative! w-full! px-4! sm:px-0!">
          {properties.length <= 3 ? (
            <div className={`grid! gap-6! pt-4! pb-4! place-items-center! ${properties.length === 1 ? 'grid-cols-1!' : properties.length === 2 ? 'grid-cols-1! sm:grid-cols-2! max-w-[900px]! mx-auto!' : 'grid-cols-1! sm:grid-cols-2! lg:grid-cols-3!'}`}>
              {properties.map((prop, i) => (
                <LuxuryCard
                  key={`${prop.id}-${i}`}
                  property={prop}
                  isActive={true}
                  photo={prop.photo}
                  onContact={() => setEnquiry({ property: prop, token: Date.now() })}
                />
              ))}
            </div>
          ) : (
          <>
          <Swiper
            key={mounted ? "client" : "server"}
            modules={[A11y, Autoplay, Pagination]}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex % properties.length)}
            slidesPerView={1}
            spaceBetween={12}
            centeredSlides={false}
            loop={true}
            watchOverflow={false}
            loopAdditionalSlides={2}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 16 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="pb-16! pt-4!"
          >
            {(properties.length === 4 ? [...properties, ...properties] : properties).map((prop, i) => (
              <SwiperSlide key={`${prop.id}-${i}`} className="flex! justify-center! items-stretch! h-auto!">
                {({ isActive }) => (
                  <LuxuryCard 
                    property={prop} 
                    isActive={isActive} 
                    photo={prop.photo}
                    onContact={() => setEnquiry({ property: properties[i % properties.length], token: Date.now() })}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Dots Navigation (Bottom Center) — swiper only */}
          <div className="flex! items-center! justify-center! gap-2! absolute! bottom-0! left-1/2! -translate-x-1/2! z-20!">
            {properties.map((_, i) => (
              <button 
                key={i} 
                onClick={() => swiperInstance?.slideToLoop(i)}
                className="focus:outline-none!"
                aria-label={`Go to slide ${i + 1}`}
              >
                <motion.div
                  animate={{
                    width: i === activeIndex ? 24 : 8,
                    opacity: i === activeIndex ? 1 : 0.4
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="h-2! rounded-full! bg-[#27427f]!"
                />
              </button>
            ))}
          </div>
          </>
          )}
        </div>
      </div>

      <FeaturedEnquiry request={enquiry} />
    </section>
  );
}

function LuxuryCard({ property, photo, onContact }: { property: FeaturedProperty, isActive: boolean, photo: string | null, onContact: () => void }) {
  const router = useRouter();
  const price = formatPrice(property);
  const priceParts = formatPriceParts(property);
  const area = usableArea(property.areaSqft, property.propertyType);
  const perSqft = area ? formatPerSqftLabel(property.pricePerSqft) : null;
  const goToDetail = () => router.push(property.detailPath);

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View ${property.propertyName || "property"}, ${price}`}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if ((e.target as HTMLElement).closest("button")) return;
          e.preventDefault();
          goToDetail();
        }
      }}
      className={`
        font-['Manrope',sans-serif]! group! w-full! max-w-none! sm:max-w-80! h-full! mx-auto! flex! flex-col! cursor-pointer!
        bg-white! rounded-2xl! border! border-gray-200! overflow-hidden!
        transition-all! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]!
        hover:border-[#27427f]/20! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]!
        focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!
      `}
    >
      {/* Photo — fixed 4:3, height comes from content below */}
      <div className="relative! w-full! aspect-[4/3]! shrink-0! overflow-hidden! bg-gray-100!">
        <ListingImage
          src={photo}
          placeholderSrc={getPlaceholderImage({ propertyType: property.propertyType })}
          alt={property.propertyName || "Property"}
          className="w-full! h-full! object-cover! transition-transform! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]! group-hover:scale-105!"
        />
        {/* Condition ribbon — flat edge flush to the card, notch facing inward.
            Vocabulary mirrors the listing-page card (property-listing-adapter.tsx). */}
        {(() => {
          const badge = getConditionBadge(property.propertyCondition);
          return badge ? (
            <span
              className="absolute! left-0! top-4! shrink-0! bg-[#eef1f8]! text-[#27427f]! text-[11px]! font-bold! tracking-wider! py-1.5! pl-3! pr-3.5! leading-none!"
              style={{ clipPath: "polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%)" }}
            >
              {badge}
            </span>
          ) : null;
        })()}
        <span className="absolute! right-2.5! top-2.5! rounded-full! bg-black/30! backdrop-blur-sm!">
          <WishlistButton propertyId={property.id} propertyType={property.propertyType} tone="onImage" />
        </span>
      </div>

      {/* Body — fills remaining height, action pinned to the bottom */}
      <div className="flex! flex-1! flex-col! bg-white! p-4!">
        <h3 className="text-lg! font-medium! text-[#27427f]! text-balance! line-clamp-2! leading-snug! transition-colors! duration-300! group-hover:text-[#1a2d59]!">
          {property.propertyName || "Luxury Property"}
        </h3>

        <p className="mt-2! flex! items-center! gap-1! text-sm! text-gray-500! min-w-0!">
          <MapPin className="w-3! h-3! shrink-0!" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate!">{property.sublocation || "Prime location"}</span>
        </p>

        {/* Price row — price with per-sq.ft alongside */}
        <div className="mt-4! flex! min-w-0! flex-wrap! items-baseline! gap-x-2! gap-y-0.5! border-t! border-gray-100! pt-3!">
          <span className="inline-flex! items-baseline! leading-none! text-gray-900!" title={price}>
            <span className="whitespace-nowrap!">
              {priceParts.prefix && (
                <span className="mr-1! text-sm! font-semibold! text-gray-400!">{priceParts.prefix}</span>
              )}
              <span className="text-2xl! font-bold!">{priceParts.main}</span>
              {priceParts.rest && (
                <span className="ml-1! text-2xl! font-bold!">{priceParts.rest}</span>
              )}
            </span>
          </span>
          {perSqft && (
            <span className="whitespace-nowrap! text-[13px]! font-medium! text-gray-500!">{perSqft}</span>
          )}
        </div>

        {/* Specs row — BHK | Area | Facing. Slots size to their content
            (flex-[0_1_auto]) instead of splitting the row in equal thirds, so a
            full facing name like "North-West" never gets clipped to "North…".
            They shrink with min-w-0 + truncate when a value runs long. */}
        <div className="mt-3! flex! min-w-0! items-center! justify-between! border-t! border-gray-100! pt-3! text-sm! font-medium! text-gray-900!">
          {typeof property.bedrooms === "number" && property.bedrooms > 0 && (
            <span className="inline-flex! min-w-0! flex-[0_1_auto]! items-center! justify-center! gap-1.5! px-0.5!" title={`${property.bedrooms} BHK`}>
              <BedDouble className="w-4! h-4! shrink-0! text-gray-700!" strokeWidth={2} aria-hidden="true" />
              <span className="truncate! whitespace-nowrap! text-base!">{property.bedrooms} BHK</span>
            </span>
          )}
          {typeof property.bedrooms === "number" && property.bedrooms > 0 && (
            <span className="w-px! self-stretch! my-1! bg-gray-200! shrink-0!" aria-hidden="true" />
          )}
          {area !== null && (
            <span className="inline-flex! min-w-0! flex-[0_1_auto]! items-center! justify-center! gap-1! pl-1.5!" title={formatArea(property.areaSqft)}>
              <Ruler className="w-4! h-4! shrink-0! text-gray-700!" strokeWidth={2} aria-hidden="true" />
              <span className="truncate! whitespace-nowrap! text-base!">{formatArea(property.areaSqft)}</span>
            </span>
          )}
          {area !== null && (
            <span className="w-px! self-stretch! my-1! bg-gray-200! shrink-0!" aria-hidden="true" />
          )}
          <span className="inline-flex! min-w-0! flex-[0_1_auto]! items-center! justify-center! pl-1.5!">
            <FacingArrow facing={property.facing} />
          </span>
        </div>

        {/* Single action — pinned to the bottom, card itself navigates to detail */}
        <div className="mt-auto! pt-4!">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="w-full! shrink-0! inline-flex! items-center! justify-center! gap-2! rounded-lg! border! border-[#27427f]! bg-transparent! px-3! py-3! text-sm! font-semibold! text-[#27427f]! transition-all! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]! hover:bg-[#27427f]! hover:text-white! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-offset-2! focus-visible:ring-[#27427f]!"
          >
            Enquire Now
          </button>
        </div>
      </div>
    </article>
  );
}


// Only the canonical condition vocabulary gets a badge; anything else stays
// unlabeled rather than printing junk on the card. Mirrors the listing-page
// card's getConditionBadge (property-listing-adapter.tsx) so both surfaces
// show identical labels.
function getConditionBadge(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  const low = value.toLowerCase();
  if (low === "resale" || low === "new" || low === "under construction") return value.toUpperCase();
  return null;
}

function formatPriceParts(p: FeaturedProperty): { prefix: string | null; main: string; rest: string | null } {
  const raw = p.postType === "Rent" ? p.monthlyRent : p.expectedSalePrice;
  const val = Number(raw);
  if (!Number.isFinite(val) || val <= 0) return { prefix: null, main: "Price on request", rest: null };
  if (val >= 10_000_000) {
    const cr = Math.floor(val / 10_000_000);
    const lk = Math.floor((val % 10_000_000) / 100_000);
    return { prefix: "Rs", main: `${cr} Cr`, rest: lk > 0 ? `${lk} L` : null };
  }
  if (val >= 100_000) return { prefix: "Rs", main: `${Math.floor(val / 100_000)} L`, rest: null };
  return { prefix: "Rs", main: val.toLocaleString("en-IN"), rest: null };
}

function formatPerSqftLabel(raw: string | number | null | undefined): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (/₹/.test(v)) return v;
  const n = Number(v.replace(/,/g, ""));
  if (Number.isFinite(n) && n > 0) return `₹${n.toLocaleString("en-IN")}/sq.ft`;
  return v;
}

function formatArea(raw: string | null | undefined): string {
  const v = (raw || "").trim();
  if (!v) return "—";
  // `area_sqft` is a decimal column, so it arrives as e.g. "1250.00".
  const num = Number(v.replace(/,/g, ""));
  if (Number.isFinite(num) && num > 0) {
    return `${Math.round(num).toLocaleString("en-IN")} sq.ft`;
  }
  return v;
}

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
