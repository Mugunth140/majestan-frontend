"use client";

import Link from "next/link";
import { FormEvent, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { createEnquiry, type FeaturedProperty } from "@/lib/api";
import { MapPin, ChevronLeft, ChevronRight, X, Phone, BedDouble, Ruler, Calendar, ArrowUpRight } from "lucide-react";

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

          {/* Navigation Arrows (Top Right) */}
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
        </div>

        {/* Carousel */}
        <div className="relative! w-full! -mx-4! px-4! sm:mx-0! sm:px-0!">
          <Swiper
            key={mounted ? "client" : "server"}
            modules={[A11y, Autoplay, Pagination]}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            slidesPerView={1}
            spaceBetween={24}
            centeredSlides={true}
            loop={properties.length > 3}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              768: { slidesPerView: 2, centeredSlides: false },
              1024: { slidesPerView: 3, centeredSlides: true },
            }}
            className="pb-16! pt-4!"
          >
            {properties.map((prop, i) => (
              <SwiperSlide key={`${prop.id}-${i}`} className="flex! justify-center! items-center!">
                {({ isActive }) => (
                  <LuxuryCard 
                    property={prop} 
                    isActive={isActive} 
                    imgSrc={prop.photo ?? FALLBACK[i % FALLBACK.length]}
                    onContact={() => setEnquiry(prop)}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Dots Navigation (Bottom Center) */}
          <div className="flex! items-center! justify-center! gap-2! absolute! bottom-0! left-1/2! -translate-x-1/2! z-20!">
            {properties.map((_, i) => (
              <button 
                key={i} 
                onClick={() => properties.length > 3 ? swiperInstance?.slideToLoop(i) : swiperInstance?.slideTo(i)}
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
        </div>
      </div>

      <AnimatePresence>
        {enquiry && <EnquiryDialog property={enquiry} onClose={() => setEnquiry(null)} />}
      </AnimatePresence>
    </section>
  );
}

function LuxuryCard({ property, isActive, imgSrc, onContact }: { property: FeaturedProperty, isActive: boolean, imgSrc: string, onContact: () => void }) {
  // Mock data for missing fields
  const isSale = property.postType?.toLowerCase().includes("sale") || property.postType?.toLowerCase().includes("buy");
  const badgeLabel = isSale ? "FOR SALE" : "FOR RENT";
  
  const idNum = property.id || 1;
  const bhk = (idNum % 3) + 2;
  const area = 1100 + (idNum * 150) % 1500;
  const year = 2024 + (idNum % 3);
  const months = ["Jan", "Mar", "Jun", "Sep", "Dec"];
  const possession = `${months[idNum % 5]} ${year}`;

  return (
    <div 
      className={`
        relative! w-full! max-w-[340px]! h-[480px]! rounded-[20px]! overflow-hidden! cursor-pointer!
        bg-white! border! border-gray-100! 
        shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)]!
        transition-all! duration-300! ease-out! group! mx-auto! hover:scale-[1.02]! hover:-translate-y-2! hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]!
      `}
    >
      {/* Image Area (top 55%) */}
      <div className="relative! h-[55%]! w-full! overflow-hidden!">
        <img 
          src={imgSrc} 
          alt={property.propertyName || "Property"} 
          className="w-full! h-full! object-cover! transition-transform! duration-700! group-hover:scale-105!"
        />
        
        {/* Liquid Glass Pill for Status */}
        <div className="absolute! top-4! left-4! z-10!">
          <span className="inline-flex! items-center! gap-1.5! rounded-full! bg-white/60! backdrop-blur-md! border! border-white/20! px-3! py-1! text-[10px]! font-bold! uppercase! tracking-wide! text-gray-900! shadow-sm!">
            {/* <span className={`w-[6px]! h-[6px]! rounded-full! ${isSale ? 'bg-[#27427f]!' : 'bg-blue-500!'}`}></span> */}
            {badgeLabel}
          </span>
        </div>

        {/* Liquid Glass Price Pill */}
        <div className="absolute! top-4! right-4! z-10!">
          <span className="inline-flex! rounded-full! bg-white/60! backdrop-blur-md! border! border-white/20! px-3! py-1.5! text-[13px]! font-semibold! text-gray-900! shadow-sm!">
            {formatPrice(property)}
          </span>
        </div>
      </div>

      {/* Card Body (bottom 45%) */}
      <div className="absolute! bottom-0! w-full! h-[45%]! p-5! flex! flex-col! justify-between! bg-white!">
        <div>
          <p className="flex! items-center! gap-1! text-[12px]! font-normal! capitalize! tracking-[0.05em]! text-gray-400!">
            <MapPin size={12} className="text-[#27427f]!" strokeWidth={2.5} />
            {property.sublocation ? `${property.sublocation}, Coimbatore` : "Coimbatore"}
          </p>
          <h3 className="text-[#27427f]! font-['Lexend',sans-serif]! text-[20px]! font-medium! leading-[1.2]! mt-1.5! truncate! tracking-tight!">
            {property.propertyName || "Luxury Property"}
          </h3>
        </div>

        <div className="h-px! w-full! bg-gray-100! my-3!" />

        {/* Stats Row */}
        <div className="grid! grid-cols-3! divide-x! divide-gray-100!">
          <div className="flex! flex-col! items-center! justify-center! px-1!">
            <div className="flex! items-center! gap-1.5! mb-1!">
              <BedDouble size={14} className="text-[#27427f]!" />
              <span className="text-gray-800! text-[13px]! font-bold!">{bhk} BHK</span>
            </div>
            <span className="text-gray-500! text-[10px]!">Unit Type</span>
          </div>
          <div className="flex! flex-col! items-center! justify-center! px-1!">
            <div className="flex! items-center! gap-1.5! mb-1!">
              <Ruler size={14} className="text-[#27427f]!" />
              <span className="text-gray-800! text-[13px]! font-bold!">{area} sq.ft</span>
            </div>
            <span className="text-gray-500! text-[10px]!">Area</span>
          </div>
          <div className="flex! flex-col! items-center! justify-center! px-1!">
            <div className="flex! items-center! gap-1.5! mb-1!">
              <Calendar size={14} className="text-[#27427f]!" />
              <span className="text-gray-800! text-[13px]! font-bold!">{possession}</span>
            </div>
            <span className="text-gray-500! text-[10px]!">Possession</span>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex! items-center! justify-between! mt-3.5!">
          <button 
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="inline-flex! items-center! gap-1.5! border! border-[#27427f]! rounded-3xl! text-[#27427f]! bg-transparent! text-[13px]! font-semibold! tracking-normal! px-5! py-3! transition-colors! duration-300! hover:bg-[#27427f]! hover:text-white!"
          >
            <Phone size={14} fill="#27427f" /> Contact
          </button>
          
          <Link 
            href={property.detailPath}
            className="px-5! py-2.5! rounded-3xl! bg-[#27427f]! text-white! flex! items-center! justify-center! gap-1! transition-transform! duration-300! hover:scale-100! text-[13px]! font-normal!"
          >
            <ArrowUpRight size={18} strokeWidth={2.5} /> View More
          </Link>
        </div>
      </div>
    </div>
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
