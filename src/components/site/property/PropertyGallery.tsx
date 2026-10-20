"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SeoProperty } from "@/lib/api/property-by-slug";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import styles from "./property-details.module.css";

/** Primary photo first, matching the full photos page. Key by property at call site. */
export function PropertyGallery({
  property,
  singlePage,
}: {
  property: SeoProperty;
  singlePage: boolean;
}) {
  const images = [...(property.images ?? [])].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const thumbnailRail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const count = images.length;
  const index = Math.min(active, Math.max(0, count - 1));
  const title = property.seo?.seoData?.overview?.h1 || property.title;
  const placeholder = getPlaceholderImage({
    propertyType: property.propertyType,
  });
  const imageUrl = images[index]?.imageUrl;
  const imageSrc =
    imageUrl && !failedImages.includes(imageUrl) ? imageUrl : placeholder;
  const photosHref = singlePage
    ? "#photos"
    : `/${property.canonicalSlug}/photos`;
  const go = (direction: number) => {
    if (count > 1)
      setActive((current) => (current + direction + count) % count);
  };
  const markFailed = (url: string) => {
    setFailedImages((failed) =>
      failed.includes(url) ? failed : [...failed, url],
    );
  };

  // Keep the selected preview in view without moving the page itself.
  useEffect(() => {
    const rail = thumbnailRail.current;
    const selected = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !selected || rail.scrollWidth <= rail.clientWidth) return;
    const left = selected.offsetLeft;
    if (
      left >= rail.scrollLeft &&
      left + selected.offsetWidth <= rail.scrollLeft + rail.clientWidth
    )
      return;
    rail.scrollTo?.({
      left: Math.max(0, left - (rail.clientWidth - selected.offsetWidth) / 2),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [index]);

  return (
    <figure aria-label={`${title} photos`} className={styles.gallery}>
      <div
        className={styles.stage}
        role={count > 1 ? "group" : undefined}
        aria-roledescription={count > 1 ? "carousel" : undefined}
        aria-label={
          count > 1
            ? "Property photos. Use left and right arrow keys to browse."
            : undefined
        }
        tabIndex={count > 1 ? 0 : undefined}
        onPointerDown={(event) => {
          if (
            event.pointerType === "mouse" ||
            (event.target as Element).closest("button, a")
          )
            return;
          gesture.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onPointerUp={(event) => {
          const start = gesture.current;
          gesture.current = null;
          if (!start || count < 2) return;
          const deltaX = event.clientX - start.x;
          const deltaY = event.clientY - start.y;
          if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY))
            go(deltaX < 0 ? 1 : -1);
        }}
        onKeyDown={(event) => {
          if (count < 2 || event.target !== event.currentTarget) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            if (event.key === "Home") setActive(0);
            else if (event.key === "End") setActive(count - 1);
            else go(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <Image
          key={imageSrc}
          src={imageSrc}
          alt={
            images[index]?.altText ||
            (count
              ? `${title} — photo ${index + 1}`
              : `${title} photo placeholder`)
          }
          title={images[index]?.titleText}
          fill
          unoptimized
          loading="eager"
          fetchPriority="high"
          onError={() => {
            if (imageUrl) markFailed(imageUrl);
          }}
          className={styles.cover}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className={`${styles.arrow} ${styles.previous}`}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className={`${styles.arrow} ${styles.next}`}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {count > 0 ? (
        <div className={styles.galleryFooter}>
          {count > 1 && (
            <div
              ref={thumbnailRail}
              className={styles.thumbnails}
              role="group"
              aria-label="Choose a property photo"
            >
              {images.map((image, photoIndex) => (
                <button
                  key={image.id}
                  type="button"
                  className={styles.thumbnail}
                  aria-label={`Show photo ${photoIndex + 1}`}
                  aria-pressed={index === photoIndex}
                  onClick={() => setActive(photoIndex)}
                >
                  <Image
                    src={
                      failedImages.includes(image.imageUrl)
                        ? placeholder
                        : image.imageUrl
                    }
                    alt=""
                    fill
                    unoptimized
                    loading="lazy"
                    onError={() => markFailed(image.imageUrl)}
                  />
                </button>
              ))}
            </div>
          )}
          <div className={styles.galleryMeta}>
            <span
              className={styles.counter}
              aria-live="polite"
              aria-atomic="true"
            >
              {index + 1} / {count}
            </span>
            <Link
              href={photosHref}
              className={styles.photosLink}
              aria-label="Open property photo gallery"
            >
              View photos
            </Link>
          </div>
        </div>
      ) : (
        <p className={styles.galleryNotice}>Photos coming soon</p>
      )}
      {imageUrl && failedImages.includes(imageUrl) && (
        <p className={styles.galleryNotice} role="status">
          Photo unavailable
        </p>
      )}
      {images[index]?.caption && (
        <figcaption className="px-4! py-3! text-sm! text-gray-600!">
          {images[index].caption}
        </figcaption>
      )}
    </figure>
  );
}
