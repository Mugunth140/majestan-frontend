"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import type { AdHeroBanner } from "@/lib/ads";
import { AdBanner } from "./ad-banner";

import "swiper/css";
import "swiper/css/pagination";

// Shown until the first "Exclusive Offers" ad is published from the CRM, so
// the home section never renders empty.
const FALLBACK_BANNERS = [
  "/assets/images/banners/banner_1.jpeg",
  "/assets/images/banners/banner_2.jpeg",
  "/assets/images/banners/banner_3.jpeg",
];

/** Home "Exclusive Offers and Highlights" carousel — CRM placement `offers` (4:1, optional 4:5 mobile). */
export function OffersCarousel({ ads }: { ads: AdHeroBanner[] }) {
  const slideCount = ads.length || FALLBACK_BANNERS.length;
  return (
    <Swiper
      modules={[A11y, Autoplay, Pagination]}
      pagination={{ clickable: true }}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      loop={slideCount > 1}
      className="migrated-swiper migrated-banner-swiper"
    >
      {ads.length > 0
        ? ads.map((ad) => (
            <SwiperSlide key={ad.id}>
              <AdBanner ad={ad} aspectClass="aspect-[4/5] md:aspect-[4/1]" desktopOnlyAspectClass="aspect-[4/1]" className="rounded-2xl!" />
            </SwiperSlide>
          ))
        : FALLBACK_BANNERS.map((src) => (
            <SwiperSlide key={src}>
              <img src={src} alt="Majestan Realty offers" className="w-full! aspect-[4/1]! object-cover! rounded-2xl!" />
            </SwiperSlide>
          ))}
    </Swiper>
  );
}
