"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { createEnquiry, type FeaturedProperty } from "@/lib/api";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { MapPin, ChevronLeft, ChevronRight, X, BedDouble, Ruler } from "lucide-react";

import { FacingArrow } from "./facing-arrow";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const FALLBACK = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=900&q=80",
];

type LuxuryFeaturedSectionProps = {
  properties: FeaturedProperty[];
  title: string;
  subtitle: string;
};

export function LuxuryFeaturedSection({ properties, title, subtitle }: LuxuryFeaturedSectionProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [enquiry, setEnquiry] = useState<FeaturedProperty | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!properties || properties.length === 0) return null;

  return (
    <section className="relative! w-full! py-15! bg-white! overflow-hidden!">
      <div className="relative! w-full! max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8! z-10!">
        {/* Section Header */}
        <div className="flex! flex-col! md:flex-row! justify-between! items-start! md:items-end! mb-12!">
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
        <div className="relative! w-full! -mx-4! px-4! sm:mx-0! sm:px-0!">
          {properties.length <= 3 ? (
            <div className={`grid! gap-6! pt-4! pb-4! place-items-center! ${properties.length === 1 ? 'grid-cols-1! max-w-[420px]! mx-auto!' : properties.length === 2 ? 'grid-cols-1! sm:grid-cols-2! max-w-[900px]! mx-auto!' : 'grid-cols-1! sm:grid-cols-2! lg:grid-cols-3!'}`}>
              {properties.map((prop, i) => (
                <LuxuryCard
                  key={`${prop.id}-${i}`}
                  property={prop}
                  isActive={true}
                  imgSrc={prop.photo ?? FALLBACK[i % FALLBACK.length]}
                  onContact={() => setEnquiry(prop)}
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
            spaceBetween={20}
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
                    imgSrc={prop.photo ?? FALLBACK[(i % properties.length) % FALLBACK.length]}
                    onContact={() => setEnquiry(properties[i % properties.length])}
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

      <AnimatePresence>
        {enquiry && <EnquiryDialog property={enquiry} onClose={() => setEnquiry(null)} />}
      </AnimatePresence>
    </section>
  );
}

function LuxuryCard({ property, imgSrc, onContact }: { property: FeaturedProperty, isActive: boolean, imgSrc: string, onContact: () => void }) {
  const router = useRouter();
  const badgeLabel = getBadgeLabel(property.postType);
  const price = formatPrice(property);
  const priceParts = formatPriceParts(property);
  const perSqft = formatPerSqftLabel(property.pricePerSqft);
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
        font-['Manrope',sans-serif]! group! w-full! max-w-80! h-full! mx-auto! flex! flex-col! cursor-pointer!
        bg-white! rounded-2xl! border! border-gray-200! overflow-hidden!
        transition-all! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]!
        hover:border-[#27427f]/20! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]!
        focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!
      `}
    >
      {/* Photo — fixed 4:3, height comes from content below */}
      <div className="relative! w-full! aspect-[4/3]! shrink-0! overflow-hidden! bg-gray-100!">
        <img
          src={imgSrc}
          alt={property.propertyName || "Property"}
          loading="lazy"
          className="w-full! h-full! object-cover! transition-transform! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]! group-hover:scale-105!"
        />
        <span className="absolute! left-3! top-3! inline-flex! items-center! rounded-full! bg-white! px-3! py-1! text-xs! font-semibold! text-[#27427f]! shadow-sm!">
          {badgeLabel}
        </span>
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

        {/* Price row — full width */}
        <div className="mt-4! flex! min-w-0! flex-col! items-start! justify-center! gap-1! border-t! border-gray-100! pt-3!">
          <span className="inline-flex! flex-col! items-start! leading-none! text-gray-900!" title={price}>
            <span className="whitespace-nowrap!">
              {priceParts.prefix && (
                <span className="mr-1! text-sm! font-semibold! text-gray-400!">{priceParts.prefix}</span>
              )}
              <span className="text-2xl! font-bold!">{priceParts.main}</span>
            </span>
            {priceParts.rest && (
              <span className="whitespace-nowrap! text-sm! font-medium! text-gray-500!">{priceParts.rest}</span>
            )}
            {perSqft && (
              <span className="whitespace-nowrap! text-xs! text-gray-400!">{perSqft}</span>
            )}
          </span>
        </div>

        {/* Specs row — BHK | Area | Facing */}
        <div className="mt-3! flex! min-w-0! items-center! gap-3! border-t! border-gray-100! pt-3! text-sm! font-medium! text-gray-900!">
          {typeof property.bedrooms === "number" && property.bedrooms > 0 && (
            <span className="inline-flex! min-w-0! flex-1! items-center! justify-center! gap-1.5!" title={`${property.bedrooms} BHK`}>
              <BedDouble className="w-4! h-4! shrink-0! text-gray-700!" strokeWidth={2} aria-hidden="true" />
              <span className="whitespace-nowrap! text-base!">{property.bedrooms} BHK</span>
            </span>
          )}
          {typeof property.bedrooms === "number" && property.bedrooms > 0 && (
            <span className="w-px! self-stretch! my-1! bg-gray-200! shrink-0!" aria-hidden="true" />
          )}
          {property.areaSqft?.trim() && (
            <span className="inline-flex! min-w-0! flex-1! items-center! justify-center! gap-1.5!" title={formatArea(property.areaSqft)}>
              <Ruler className="w-4! h-4! shrink-0! text-gray-700!" strokeWidth={2} aria-hidden="true" />
              <span className="truncate! text-base!">{formatArea(property.areaSqft)}</span>
            </span>
          )}
          {property.areaSqft?.trim() && (
            <span className="w-px! self-stretch! my-1! bg-gray-200! shrink-0!" aria-hidden="true" />
          )}
          <span className="inline-flex! min-w-0! flex-1! items-center! justify-center!">
            <FacingArrow facing={property.facing} />
          </span>
        </div>

        {/* Single action — pinned to the bottom, card itself navigates to detail */}
        <div className="mt-auto! pt-4!">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="w-full! shrink-0! inline-flex! items-center! justify-center! gap-2! rounded-lg! bg-[#27427f]! px-3! py-3! text-sm! font-semibold! text-white! transition-all! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]! hover:bg-[#1a2d59]! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-offset-2! focus-visible:ring-[#27427f]!"
          >
            Enquire
          </button>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ENQUIRY DIALOG (Adapted for Light Mode)
══════════════════════════════════════════════════════════════════ */
function EnquiryDialog({ property, onClose }: { property: FeaturedProperty; onClose: () => void }) {
  const [form,   setForm]   = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await createEnquiry({
        ...form,
        propertyType: property.propertyType,
        listingType:  property.postType ?? undefined,
        message:      `${form.message}\nProperty: ${property.propertyName ?? ""}`,
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch { setStatus("error"); }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      role="presentation" onClick={onClose}
      className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! bg-gray-900/40! backdrop-blur-sm! p-4!"
    >
      <motion.div
        initial={{ opacity: 0, y: 52, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 36, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        role="dialog" aria-modal="true" aria-labelledby="enquiry-title"
        onClick={(e) => e.stopPropagation()}
        className="relative! w-full! max-w-md! rounded-[2rem]! bg-white! border! border-gray-100! shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]! p-8! sm:p-10!"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          type="button" onClick={onClose} aria-label="Close"
          className="absolute! top-5! right-5! w-8! h-8! rounded-full! bg-gray-100! flex! items-center! justify-center! text-gray-500! hover:bg-gray-200! hover:text-gray-900! transition-colors!"
        >
          <X size={15} strokeWidth={2.5} />
        </motion.button>

        <div className="mb-6!">
          <span className="text-[9px]! font-black! uppercase! tracking-[0.18em]! text-[#27427f]! block! mb-1.5!">
            {property.postType ?? "Enquiry"}
          </span>
          <h4 id="enquiry-title" className="text-xl! font-bold! text-gray-900! leading-snug! tracking-tight! pr-8!">
            {property.propertyName ?? "this property"}
          </h4>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div key="ok"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="py-10! text-center!"
            >
              <div className="w-12! h-12! rounded-full! bg-[#27427f]/10! flex! items-center! justify-center! mx-auto! mb-4!">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27427f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-semibold! text-gray-900! text-base!">Enquiry submitted!</p>
              <p className="text-sm! text-gray-500! mt-1!">We will contact you shortly.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0 }} className="flex! flex-col! gap-4!">
              {([
                { label: "Full Name", key: "name",  type: "text",  required: true,  ph: "e.g. Arjun Selvam" },
                { label: "Email",     key: "email", type: "email", required: false, ph: "you@example.com" },
                { label: "Phone",     key: "phone", type: "tel",   required: true,  ph: "+91 98400 00000" },
              ] as const).map((f) => (
                <div key={f.key} className="flex! flex-col! gap-1.5!">
                  <label className="text-[10px]! font-black! uppercase! tracking-wider! text-gray-500!">
                    {f.label}{f.required && <span className="text-[#27427f] ml-0.5">*</span>}
                  </label>
                  <input
                    type={f.type} required={f.required} placeholder={f.ph}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full! rounded-xl! border! border-gray-200! bg-gray-50! px-4! py-3! text-sm! text-gray-900! placeholder:text-gray-400! outline-none! focus:border-[#27427f]! transition-all! duration-200!"
                  />
                </div>
              ))}
              <div className="flex! flex-col! gap-1.5!">
                <label className="text-[10px]! font-black! uppercase! tracking-wider! text-gray-500!">Message</label>
                <textarea rows={3} placeholder="Any specific requirements..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full! rounded-xl! border! border-gray-200! bg-gray-50! px-4! py-3! text-sm! text-gray-900! placeholder:text-gray-400! outline-none! focus:border-[#27427f]! transition-all! duration-200! resize-none!"
                />
              </div>
              {status === "error" && (
                <p className="text-xs! text-red-500! font-semibold!">Could not submit. Please try again.</p>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                type="submit" disabled={status === "submitting"}
                className="mt-1! w-full! rounded-xl! bg-[#27427f]! py-3.5! text-sm! font-black! uppercase! tracking-wider! text-white! disabled:opacity-55! transition-all!"
              >
                {status === "submitting" ? "Sending..." : "Submit Enquiry"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function getBadgeLabel(postType: string | null): string {
  const v = (postType || "").toLowerCase();
  if (v.includes("rent") || v.includes("lease")) return "For rent";
  if (v.includes("sale") || v.includes("sell") || v.includes("buy")) return "For sale";
  return postType || "Featured";
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
