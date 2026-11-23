"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import type { AdHeroBanner } from "@/lib/ads";
import { AdBanner } from "./ad-banner";

import "swiper/css";
import "swiper/css/pagination";

// Shown until the first "Exclusive Offers" ad is published from the CRM, so
// the home section never renders empty.
// WebP at 800w/1600w (~25/70 KB each); the 3600w JPEGs were 1.3-1.7 MB apiece
// and loaded eagerly, competing with the hero image for bandwidth (LCP).
const FALLBACK_BANNERS = [1, 2, 3].map((n) => `/assets/images/banners/banner_${n}`);

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
              <img
                src={`${src}-1600.webp`}
                srcSet={`${src}-800.webp 800w, ${src}-1600.webp 1600w`}
                sizes="(max-width: 1400px) 100vw, 1400px"
                width={1600}
                height={400}
                loading="lazy"
                decoding="async"
                alt="Majestan Realty offers"
                className="w-full! h-auto! aspect-[4/1]! object-cover! rounded-2xl!"
              />
            </SwiperSlide>
          ))}
    </Swiper>
  );
}
