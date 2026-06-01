"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import { createEnquiry, type FeaturedProperty, type HomeBanner } from "@/lib/api";

type PropertyCarouselProps =
  | {
      properties: FeaturedProperty[];
      banners?: never;
      emptyMessage: string;
      variant?: "properties";
    }
  | {
      banners: HomeBanner[];
      properties?: never;
      emptyMessage: string;
      variant: "banner";
    };

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
    return <p className="migrated-empty">{props.emptyMessage}</p>;
  }

  return <PropertyCarousel properties={props.properties} />;
}

function PropertyCarousel({ properties }: { properties: FeaturedProperty[] }) {
  const [selectedProperty, setSelectedProperty] = useState<FeaturedProperty | null>(null);

  return (
    <>
      <Swiper
        modules={[A11y, Navigation, Pagination, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        coverflowEffect={{
          rotate: 0,
          stretch: -30,
          depth: 150,
          modifier: 2,
          slideShadows: false,
        }}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1.2, spaceBetween: 15 },
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 32 },
        }}
        className="migrated-swiper !pb-16"
      >
        {properties.map((property, i) => {
          const FALLBACK_IMAGES = [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          ];
          const imgUrl = property.photo ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

          return (
          <SwiperSlide key={`${property.propertyType}-${property.id}`}>
            <article className="group relative flex flex-col gap-5 p-2">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-[0_20px_40px_-15px_rgba(22,30,45,0.05)] aspect-[4/3] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(39,66,127,0.15)]">
                <Link href={property.detailPath} target="_blank" className="absolute inset-0 block w-full h-full">
                  <img
                    src={imgUrl}
                    alt={property.propertyName ?? "Featured Property"}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] pointer-events-none" />
                </Link>
                <div className="absolute top-5 left-5 z-10 pointer-events-none">
                  <span className="inline-flex rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#27427f] shadow-sm">
                    {property.postType}
                  </span>
                </div>
              </div>

              <div className="px-2 flex flex-col gap-3">
                <div>
                  <h5 className="text-xl font-bold text-[#27427f] tracking-tight leading-tight mb-1">
                    <Link href={property.detailPath} target="_blank" className="hover:text-[#ffc900] transition-colors">
                      {property.propertyName ?? "Featured Property"}
                    </Link>
                  </h5>
                  <p className="text-sm font-medium text-[#27427f]/60 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffc900]"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {property.sublocation ?? "Coimbatore"}, Coimbatore
                  </p>
                </div>
                
                <div className="flex items-end justify-between border-t border-[#27427f]/10 pt-4 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#27427f]/40 mb-1">Price</span>
                    <h6 className="text-lg font-black text-[#27427f] leading-none">
                      {formatPrice(property)}
                    </h6>
                    {property.postType === "Sell" && property.pricePerSqft ? (
                      <span className="text-xs font-semibold text-[#27427f]/60 mt-1.5">
                        {property.pricePerSqft} / Sqft
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-full bg-[#27427f]/5 px-5 py-2.5 text-xs font-bold text-[#27427f] transition-all hover:bg-[#27427f] hover:text-[#ffc900]"
                      type="button"
                      onClick={() => setSelectedProperty(property)}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </SwiperSlide>
          );
        })}
      </Swiper>

      <EnquiryDialog
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </>
  );
}

function EnquiryDialog({
  property,
  onClose,
}: {
  property: FeaturedProperty | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  if (!property) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      await createEnquiry({
        ...form,
        propertyType: property?.propertyType,
        listingType: property?.postType ?? undefined,
        message: `${form.message}\nProperty: ${property?.propertyName ?? ""}`,
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="migrated-dialog-backdrop" role="presentation">
      <div className="migrated-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
        <button className="migrated-dialog-close" type="button" onClick={onClose} aria-label="Close enquiry form">
          <i className="icon-close" />
        </button>
        <h4 id="enquiry-title">Contact for {property.propertyName ?? "this property"}</h4>
        <form className="migrated-enquiry-form" onSubmit={onSubmit}>
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Name"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
          />
          <input
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="Phone"
          />
          <textarea
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            placeholder="Message"
            rows={3}
          />
          <button className="tf-btn bg-color-primary pd-3" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Sending..." : "Submit"}
          </button>
          {status === "success" ? <p className="migrated-form-success">Thanks, we will contact you shortly.</p> : null}
          {status === "error" ? <p className="migrated-form-error">Could not submit enquiry. Please try again.</p> : null}
        </form>
      </div>
    </div>
  );
}

function formatPrice(property: FeaturedProperty) {
  const raw =
    property.postType === "Rent" ? property.monthlyRent : property.expectedSalePrice;
  const numericValue = Number(raw);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Price on request";
  }

  if (numericValue >= 10000000) {
    const crores = Math.floor(numericValue / 10000000);
    const lakhs = Math.floor((numericValue % 10000000) / 100000);
    return `Rs ${crores} Cr${lakhs > 0 ? ` ${lakhs} L` : ""}`;
  }

  if (numericValue >= 100000) {
    const lakhs = Math.floor(numericValue / 100000);
    return `Rs ${lakhs} L`;
  }

  return `Rs ${numericValue.toLocaleString("en-IN")}`;
}
