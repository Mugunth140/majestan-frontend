"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
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
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop={props.banners.length > 1}
        className="migrated-swiper migrated-banner-swiper"
      >
        {props.banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {banner.href ? (
              <a href={banner.href} target="_blank" rel="noreferrer">
                <img src={banner.image} alt="Majestan Realty banner" />
              </a>
            ) : (
              <img src={banner.image} alt="Majestan Realty banner" />
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
        modules={[A11y, Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 15 },
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 32 },
        }}
        className="migrated-swiper"
      >
        {properties.map((property) => (
          <SwiperSlide key={`${property.propertyType}-${property.id}`}>
            <article className="box-house hover-img migrated-property-card">
              <div className="image-wrap">
                <Link href={property.detailPath} target="_blank">
                  <img src={property.photo ?? "/assets/images/home/apartment-buy.png"} alt="" />
                </Link>
              </div>
              <div className="content">
                <h5 className="title">
                  <Link href={property.detailPath} target="_blank">
                    {property.propertyName ?? "Featured Property"}
                  </Link>
                </h5>
                <p className="location text-1 flex items-center gap-6 Featured_Properties">
                  <i className="icon-location" />
                  {property.sublocation ?? "Coimbatore"}, Coimbatore
                </p>
                <div className="bot flex justify-between items-center migrated-property-footer">
                  <h5 className="price">
                    {formatPrice(property)}
                    {property.postType === "Sell" && property.pricePerSqft ? (
                      <span className="h5 lh-30 fw-4 text-color-default pricesort">
                        {property.pricePerSqft} / Sqft
                      </span>
                    ) : null}
                  </h5>
                  <div className="d-flex gap-2">
                    <Link href={property.detailPath} target="_blank" className="tf-btn style-border pd-4 property-details-btn">
                      Details
                    </Link>
                    <button
                      className="tf-btn style-border pd-4 contact-btn"
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
        ))}
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
