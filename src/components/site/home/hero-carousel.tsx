"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { AdHeroBanner } from "@/lib/ads";
import { resolveAdHref } from "@/lib/ads";

import "swiper/css";

interface HeroCarouselProps {
  banners: AdHeroBanner[];
  citySlug: string;
}

// Background slideshow for the hero. Plain <img> (not next/image) so R2
// URLs need no remote-pattern config. First image eager (LCP), rest lazy.
export function HeroCarousel({ banners, citySlug }: HeroCarouselProps) {
  if (banners.length === 0) return null;
  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={1}
      loop={banners.length > 1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      className="absolute! inset-0! w-full! h-full!"
    >
      {banners.map((banner, i) => (
        <SwiperSlide key={banner.id}>
          <Link
            href={resolveAdHref(banner, citySlug)}
            aria-label={banner.title || "Promotion"}
            className="absolute! inset-0!"
          >
            <img
              src={banner.desktopImage}
              alt={banner.title || "Promotion"}
              className="hidden! md:block! absolute! inset-0! w-full! h-full! object-cover! object-center! select-none! pointer-events-none!"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            <img
              src={banner.mobileImage}
              alt={banner.title || "Promotion"}
              className="md:hidden! absolute! inset-0! w-full! h-full! object-cover! object-center! select-none! pointer-events-none!"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
