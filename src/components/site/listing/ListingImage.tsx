"use client";

import { useEffect, useRef, useState } from "react";
import { responsiveImage } from "@/lib/responsive-images";

type ListingImageProps = {
  src: string | null | undefined;
  placeholderSrc: string;
  alt: string;
  title?: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
  /** A portrait crop served by picture, so phones never request both covers. */
  mobileSrc?: string | null;
  "aria-label"?: string;
};

/** Native lazy loading and cache handling; photos are visible before hydration. */
export function ListingImage(props: ListingImageProps) {
  return <NativeListingImage key={`${props.src || ""}:${props.mobileSrc || ""}`} {...props} />;
}

function NativeListingImage({ src, placeholderSrc, alt, className, eager = false,
  sizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 320px", mobileSrc, ...rest }: ListingImageProps) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const attempts = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
  }, []);

  const photo = src && !failed ? src : placeholderSrc;
  const image = responsiveImage(photo, sizes);
  const portrait = mobileSrc && !failed ? responsiveImage(mobileSrc, sizes) : null;
  return (
    <picture className="contents">
      {portrait && <source media="(max-width: 639px)" srcSet={portrait.srcSet || portrait.src} sizes={sizes} />}
      {/* getImageProps supplies responsive optimizer URLs without another image runtime. */}
      <img {...image} key={`${src}-${attempt}`} alt={alt} className={className}
        loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"}
        decoding="async" draggable={false} {...rest}
        onError={() => {
          if (!src || failed) return;
          if (attempts.current === 0) {
            attempts.current = 1;
            retryTimer.current = setTimeout(() => setAttempt(value => value + 1), 1500);
          } else setFailed(true);
        }} />
    </picture>
  );
}
