"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import { createEnquiry, type FeaturedProperty, type HomeBanner } from "@/lib/api";
import { MapPin, ChevronLeft, ChevronRight, X, ArrowUpRight, Phone, Tag } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ─────────── types ─────────── */
type PropertyCarouselProps =
  | { properties: FeaturedProperty[]; banners?: never; emptyMessage: string; variant?: "properties" }
  | { banners: HomeBanner[]; properties?: never; emptyMessage: string; variant: "banner" };

/* ─────────── fallback images ─────────── */
const FALLBACK = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=900&q=80",
];

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
  const [enquiry, setEnquiry] = useState<FeaturedProperty | null>(null);
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
                imgSrc={prop.photo ?? FALLBACK[i % FALLBACK.length]}
                onContact={() => setEnquiry(prop)}
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

      <AnimatePresence>
        {enquiry && <EnquiryDialog property={enquiry} onClose={() => setEnquiry(null)} />}
      </AnimatePresence>
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
  property, isActive, imgSrc, onContact,
}: {
  property: FeaturedProperty;
  isActive: boolean;
  imgSrc: string;
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
      <img
        src={imgSrc}
        alt={property.propertyName ?? "Property"}
        className="absolute! inset-0! w-full! h-full! object-cover! transition-transform! duration-700!"
        style={{ transform: isActive ? "scale(1.06)" : "scale(1.01)" }}
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
   ENQUIRY DIALOG
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
      className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! bg-[#0a1628]/60! backdrop-blur-sm! p-4!"
    >
      <motion.div
        initial={{ opacity: 0, y: 52, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 36, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        role="dialog" aria-modal="true" aria-labelledby="enquiry-title"
        onClick={(e) => e.stopPropagation()}
        className="relative! w-full! max-w-md! rounded-[2rem]! bg-white! border! border-black/5! shadow-[0_40px_80px_-20px_rgba(10,22,40,0.22)]! p-8! sm:p-10!"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          type="button" onClick={onClose} aria-label="Close"
          className="absolute! top-5! right-5! w-8! h-8! rounded-full! bg-[#27427f]/6! flex! items-center! justify-center! text-[#27427f]/55! hover:bg-[#27427f]/10! transition-colors!"
        >
          <X size={15} strokeWidth={2.5} />
        </motion.button>

        <div className="mb-6!">
          <span className="text-[9px]! font-black! uppercase! tracking-[0.18em]! text-[#ffc900]! block! mb-1.5!">
            {property.postType ?? "Enquiry"}
          </span>
          <h4 id="enquiry-title" className="text-xl! font-bold! text-[#1a2d5a]! leading-snug! tracking-tight! pr-8!">
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
              <div className="w-12! h-12! rounded-full! bg-[#27427f]/8! flex! items-center! justify-center! mx-auto! mb-4!">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27427f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-semibold! text-[#1a2d5a]! text-base!">Enquiry submitted!</p>
              <p className="text-sm! text-[#27427f]/50! mt-1!">We will contact you shortly.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0 }} className="flex! flex-col! gap-4!">
              {([
                { label: "Full Name", key: "name",  type: "text",  required: true,  ph: "e.g. Arjun Selvam" },
                { label: "Email",     key: "email", type: "email", required: false, ph: "you@example.com" },
                { label: "Phone",     key: "phone", type: "tel",   required: true,  ph: "+91 98400 00000" },
              ] as const).map((f) => (
                <div key={f.key} className="flex! flex-col! gap-1.5!">
                  <label className="text-[10px]! font-black! uppercase! tracking-wider! text-[#27427f]/55!">
                    {f.label}{f.required && <span className="text-[#ffc900] ml-0.5">*</span>}
                  </label>
                  <input
                    type={f.type} required={f.required} placeholder={f.ph}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full! rounded-xl! border! border-[#27427f]/10! bg-[#f7f9fc]! px-4! py-3! text-sm! text-[#1a2d5a]! placeholder:text-[#27427f]/28! outline-none! focus:border-[#27427f]/35! focus:bg-white! transition-all! duration-200!"
                  />
                </div>
              ))}
              <div className="flex! flex-col! gap-1.5!">
                <label className="text-[10px]! font-black! uppercase! tracking-wider! text-[#27427f]/55!">Message</label>
                <textarea rows={3} placeholder="Any specific requirements..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full! rounded-xl! border! border-[#27427f]/10! bg-[#f7f9fc]! px-4! py-3! text-sm! text-[#1a2d5a]! placeholder:text-[#27427f]/28! outline-none! focus:border-[#27427f]/35! focus:bg-white! transition-all! duration-200! resize-none!"
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
