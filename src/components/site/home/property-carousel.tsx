"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useInView } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { createEnquiry, type FeaturedProperty, type HomeBanner } from "@/lib/api";
import { MapPin, ChevronLeft, ChevronRight, X, ArrowUpRight, Phone } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TYPES                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
type PropertyCarouselProps =
  | { properties: FeaturedProperty[]; banners?: never; emptyMessage: string; variant?: "properties" }
  | { banners: HomeBanner[]; properties?: never; emptyMessage: string; variant: "banner" };

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ENTRY POINT                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
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

  return <ArcCarousel properties={props.properties} />;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONSTANTS                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const FALLBACK = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=900&q=80",
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ARC CAROUSEL                                                               */
/*  Cards sit on a curved arc — center card is foreground, sides curve away.  */
/* ─────────────────────────────────────────────────────────────────────────── */
function ArcCarousel({ properties }: { properties: FeaturedProperty[] }) {
  const count = properties.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasEntered, setHasEntered]   = useState(false);   // entry animation done?
  const [paused, setPaused]           = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<FeaturedProperty | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView     = useInView(wrapperRef, { once: true, margin: "0px 0px -80px 0px" });

  // spring-smoothed float index — drives all card positions
  const floatIndex  = useSpring(activeIndex, { stiffness: 70, damping: 20 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── 1. entry animation: sweep from right on first view ── */
  useEffect(() => {
    if (!inView || hasEntered) return;
    // stagger the initial sweep: advance index 0→1→2… once to "show off" the arc
    let step = 0;
    const total = Math.min(count - 1, 3); // sweep through 3 positions max
    const sweep = setInterval(() => {
      step++;
      if (step > total) {
        clearInterval(sweep);
        // reset to first card and mark entry done
        setActiveIndex(0);
        floatIndex.set(0);
        setTimeout(() => setHasEntered(true), 600);
      } else {
        setActiveIndex(step);
      }
    }, 550);
    return () => clearInterval(sweep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  /* ── 2. keep spring in sync with activeIndex ── */
  useEffect(() => {
    floatIndex.set(activeIndex);
  }, [activeIndex, floatIndex]);

  /* ── 3. auto-scroll every 3.5 s (only after entry) ── */
  useEffect(() => {
    if (!hasEntered || paused) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hasEntered, paused, count]);

  /* ── 4. keyboard navigation ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActiveIndex((p) => (p + 1) % count);
      if (e.key === "ArrowLeft")  setActiveIndex((p) => (p - 1 + count) % count);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count]);

  return (
    <div
      ref={wrapperRef}
      className="relative! w-full! overflow-hidden!"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── ARC STAGE ── */}
      <div
        className="relative! w-full!"
        style={{ height: "clamp(340px, 52vw, 560px)", perspective: "1400px", perspectiveOrigin: "50% 80%" }}
      >
        {properties.map((property, i) => {
          const imgSrc = property.photo ?? FALLBACK[i % FALLBACK.length];
          return (
            <ArcCard
              key={`${property.id}-${i}`}
              property={property}
              index={i}
              count={count}
              floatIndex={floatIndex}
              isActive={i === activeIndex}
              imgSrc={imgSrc}
              onContact={() => setSelectedProperty(property)}
            />
          );
        })}
      </div>

      {/* ── MINIMALIST NAV ── */}
      <div className="flex! items-center! justify-center! gap-5! mt-6!">
        <button
          type="button"
          aria-label="Previous property"
          onClick={() => setActiveIndex((p) => (p - 1 + count) % count)}
          className="w-9! h-9! rounded-full! border! border-[#27427f]/14! bg-white! flex! items-center! justify-center! text-[#27427f]/45! hover:border-[#27427f]/40! hover:text-[#27427f]! transition-all! duration-200! shadow-sm!"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        {/* Dot rail */}
        <div className="flex! items-center! gap-2!">
          {properties.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to property ${i + 1}`}
              onClick={() => setActiveIndex(i)}
            >
              <motion.span
                animate={{
                  width:           i === activeIndex ? 26 : 6,
                  backgroundColor: i === activeIndex ? "#27427f" : "rgba(39,66,127,0.18)",
                }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                style={{ display: "block", height: 6, borderRadius: 999 }}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next property"
          onClick={() => setActiveIndex((p) => (p + 1) % count)}
          className="w-9! h-9! rounded-full! border! border-[#27427f]/14! bg-white! flex! items-center! justify-center! text-[#27427f]/45! hover:border-[#27427f]/40! hover:text-[#27427f]! transition-all! duration-200! shadow-sm!"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      <AnimatePresence>
        {selectedProperty && (
          <EnquiryDialog property={selectedProperty} onClose={() => setSelectedProperty(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ARC CARD — writes transforms directly to DOM via rAF listener             */
/*  No React re-renders on every spring tick.                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Arc geometry constants */
const ARC_ANGLE_PER_SLOT = 22;   // degrees between cards
const ARC_RADIUS         = 1000; // px — larger = flatter curve
const ARC_CURVE_DEPTH    = 0.06; // vertical dip factor

function ArcCard({
  property, index, count, floatIndex, isActive, imgSrc, onContact,
}: {
  property: FeaturedProperty;
  index: number;
  count: number;
  floatIndex: ReturnType<typeof useSpring>;
  isActive: boolean;
  imgSrc: string;
  onContact: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return floatIndex.on("change", (fi) => {
      if (!ref.current) return;
      const offset    = index - fi;           // float, e.g. -1.4
      const absOffset = Math.abs(offset);

      // hide cards too far away
      if (absOffset > (count > 4 ? 2.8 : 1.8)) {
        ref.current.style.opacity = "0";
        ref.current.style.pointerEvents = "none";
        return;
      }

      const thetaDeg = offset * ARC_ANGLE_PER_SLOT;
      const thetaRad = (thetaDeg * Math.PI) / 180;

      // horizontal position along arc
      const x = Math.sin(thetaRad) * ARC_RADIUS;
      // vertical: arc shape — center sits at y=0, sides drop down slightly
      const y = (1 - Math.cos(thetaRad)) * ARC_RADIUS * ARC_CURVE_DEPTH;
      // card tilts to follow the arc tangent
      const rotateY = -thetaDeg * 0.45;
      // depth scale + opacity
      const scale   = Math.max(0.58, 1 - absOffset * 0.145);
      const opacity = Math.max(0.2,  1 - absOffset * 0.32);
      const zIndex  = Math.round(20 - absOffset * 6);

      ref.current.style.transform     = `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotateY(${rotateY}deg) scale(${scale})`;
      ref.current.style.opacity        = String(opacity);
      ref.current.style.zIndex         = String(zIndex);
      ref.current.style.pointerEvents  = absOffset < 0.6 ? "auto" : "none";
    });
  }, [floatIndex, index, count]);

  // Card width: responsive via CSS clamp
  return (
    <div
      ref={ref}
      className="absolute! top-0! left-1/2! transition-[box-shadow]! duration-500!"
      style={{
        width: "clamp(200px, 28vw, 320px)",
        willChange: "transform, opacity",
        transformStyle: "preserve-3d",
      }}
    >
      {/* ── Card shell ── */}
      <div
        className={`
          relative! overflow-hidden! rounded-[1.75rem]!
          border! border-black/5! bg-white!
          shadow-[0_14px_48px_-12px_rgba(39,66,127,0.14)]!
          ${isActive ? "shadow-[0_28px_72px_-16px_rgba(39,66,127,0.28)]!" : ""}
          transition-shadow! duration-500!
        `}
        style={{ aspectRatio: "3/4" }}
      >
        {/* Image */}
        <img
          src={imgSrc}
          alt={property.propertyName ?? "Property"}
          className="absolute! inset-0! w-full! h-full! object-cover! transition-transform! duration-700!"
          style={{ transform: isActive ? "scale(1.05)" : "scale(1)" }}
        />

        {/* Gradient overlay */}
        <div className="absolute! inset-0! bg-gradient-to-t! from-[#0d1b3e]/92! via-[#0d1b3e]/25! to-transparent!" />

        {/* Post-type badge */}
        <span className="absolute! top-4! left-4! inline-flex! rounded-full! bg-white/90! backdrop-blur-md! border! border-white/30! shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]! px-3! py-1.5! text-[8px]! font-black! uppercase! tracking-[0.16em]! text-[#27427f]!">
          {property.postType}
        </span>

        {/* Content */}
        <div className="absolute! bottom-0! left-0! right-0! p-5!">
          <p className="flex! items-center! gap-1! text-[9px]! font-bold! uppercase! tracking-wider! text-white/55! mb-1.5!">
            <MapPin size={9} strokeWidth={2.5} className="text-[#ffc900] shrink-0" />
            {property.sublocation ?? "Coimbatore"}
          </p>
          <h5 className="text-sm! font-bold! text-white! leading-snug! line-clamp-2! mb-3!">
            {property.propertyName ?? "Featured Property"}
          </h5>

          {/* Active-only bottom row */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="flex! items-center! justify-between! pt-3! border-t! border-white/12!"
              >
                <span className="text-[15px]! font-black! text-white! leading-none!">
                  {formatPrice(property)}
                </span>
                <div className="flex! items-center! gap-1.5!">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onContact(); }}
                    className="inline-flex! items-center! gap-1! rounded-full! bg-white/18! backdrop-blur-sm! border! border-white/18! px-3! py-1.5! text-[8px]! font-black! uppercase! tracking-wider! text-white! hover:bg-[#ffc900]! hover:text-[#27427f]! hover:border-[#ffc900]! transition-all! duration-200!"
                  >
                    <Phone size={8} strokeWidth={2.5} /> Contact
                  </button>
                  <Link
                    href={property.detailPath}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex! items-center! justify-center! w-7! h-7! rounded-full! bg-[#ffc900]! text-[#27427f]! hover:scale-110! transition-transform! duration-200!"
                  >
                    <ArrowUpRight size={11} strokeWidth={3} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inner refraction ring */}
        <div className="absolute! inset-0! rounded-[1.75rem]! shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]! pointer-events-none!" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ENQUIRY DIALOG                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function EnquiryDialog({ property, onClose }: { property: FeaturedProperty; onClose: () => void }) {
  const [form,   setForm]   = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! bg-[#0d1b3e]/55! backdrop-blur-sm! p-4!"
    >
      <motion.div
        initial={{ opacity: 0, y: 56, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 36, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        role="dialog" aria-modal="true" aria-labelledby="enquiry-title"
        onClick={(e) => e.stopPropagation()}
        className="relative! w-full! max-w-md! rounded-[2rem]! bg-white! border! border-black/5! shadow-[0_40px_80px_-20px_rgba(13,27,62,0.22)]! p-8! sm:p-10!"
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
                { label: "Full Name", key: "name",  type: "text",  required: true,  placeholder: "e.g. Arjun Selvam" },
                { label: "Email",     key: "email", type: "email", required: false, placeholder: "you@example.com" },
                { label: "Phone",     key: "phone", type: "tel",   required: true,  placeholder: "+91 98400 00000" },
              ] as const).map((f) => (
                <div key={f.key} className="flex! flex-col! gap-1.5!">
                  <label className="text-[10px]! font-black! uppercase! tracking-wider! text-[#27427f]/55!">
                    {f.label}{f.required && <span className="text-[#ffc900] ml-0.5">*</span>}
                  </label>
                  <input
                    type={f.type} required={f.required} placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full! rounded-xl! border! border-[#27427f]/10! bg-[#f7f9fc]! px-4! py-3! text-sm! text-[#1a2d5a]! placeholder:text-[#27427f]/28! outline-none! focus:border-[#27427f]/35! focus:bg-white! transition-all! duration-200!"
                  />
                </div>
              ))}
              <div className="flex! flex-col! gap-1.5!">
                <label className="text-[10px]! font-black! uppercase! tracking-wider! text-[#27427f]/55!">Message</label>
                <textarea rows={3} placeholder="Any specific requirements..." value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full! rounded-xl! border! border-[#27427f]/10! bg-[#f7f9fc]! px-4! py-3! text-sm! text-[#1a2d5a]! placeholder:text-[#27427f]/28! outline-none! focus:border-[#27427f]/35! focus:bg-white! transition-all! duration-200! resize-none!"
                />
              </div>
              {status === "error" && <p className="text-xs! text-red-500! font-semibold!">Could not submit. Please try again.</p>}
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

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PRICE FORMATTER                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function formatPrice(property: FeaturedProperty) {
  const raw = property.postType === "Rent" ? property.monthlyRent : property.expectedSalePrice;
  const val = Number(raw);
  if (!Number.isFinite(val) || val <= 0) return "Price on request";
  if (val >= 10000000) {
    const cr = Math.floor(val / 10000000);
    const lk = Math.floor((val % 10000000) / 100000);
    return `Rs ${cr} Cr${lk > 0 ? ` ${lk} L` : ""}`;
  }
  if (val >= 100000) return `Rs ${Math.floor(val / 100000)} L`;
  return `Rs ${val.toLocaleString("en-IN")}`;
}
