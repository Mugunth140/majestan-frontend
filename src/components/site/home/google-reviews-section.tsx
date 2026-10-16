"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { GoogleReview, GoogleReviews } from "@/lib/api";

/** Google's "G" mark, for attribution. */
function GoogleMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex! items-center! gap-0.5!" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => {
        // Partial fill for the summary's fractional rating (e.g. 4.8).
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative! inline-block!" style={{ width: size, height: size }}>
            <Star size={size} className="absolute! inset-0! fill-[#e4e7ec]! text-[#e4e7ec]!" strokeWidth={0} />
            <span className="absolute! inset-0! overflow-hidden!" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="fill-[#fbbc04]! text-[#fbbc04]!" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Avatar({ review }: { review: GoogleReview }) {
  const [failed, setFailed] = useState(false);
  const initials = review.authorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return review.photoUrl && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={review.photoUrl}
      alt=""
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-10! w-10! shrink-0! rounded-full! object-cover!"
    />
  ) : (
    <span className="inline-flex! h-10! w-10! shrink-0! items-center! justify-center! rounded-full! bg-[#eef2fb]! text-[14px]! font-bold! text-[#27427f]!">
      {initials || "G"}
    </span>
  );
}

/** Long reviews collapse to five lines, with Read more / Show less. */
const CLAMP_AT = 260;

function ReviewCard({ review }: { review: GoogleReview }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > CLAMP_AT;
  const name = review.authorUrl ? (
    <a
      href={review.authorUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="truncate! text-[15px]! font-semibold! text-[#101828]! no-underline! hover:underline! underline-offset-4!"
    >
      {review.authorName}
    </a>
  ) : (
    <span className="truncate! text-[15px]! font-semibold! text-[#101828]!">{review.authorName}</span>
  );

  return (
    <article
      data-slide
      className="flex! w-[86%]! shrink-0! snap-start! flex-col! rounded-2xl! border! border-solid! border-[#eaecf0]! bg-white! p-6! shadow-[0_1px_2px_rgba(16,24,40,0.04)]! sm:w-[calc((100%-16px)/2)]! lg:w-[calc((100%-40px)/3)]!"
    >
      <div className="flex! items-center! justify-between!">
        <Stars rating={review.rating} />
        <GoogleMark className="h-5! w-5!" />
      </div>

      <p
        className={`m-0! mt-4! flex-1! whitespace-pre-line! text-[15px]! font-normal! leading-[1.7]! text-[#344054]! ${
          long && !expanded ? "line-clamp-5!" : ""
        }`}
      >
        {review.text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2! self-start! cursor-pointer! border-0! bg-transparent! p-0! text-[14px]! font-semibold! text-[#27427f]! hover:underline! underline-offset-4!"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-5! flex! items-center! gap-3! border-t! border-solid! border-[#f2f4f7]! pt-4!">
        <Avatar review={review} />
        <div className="flex! min-w-0! flex-col!">
          {name}
          <span className="text-[13px]! font-medium! text-[#667085]!">{review.relativeTime}</span>
        </div>
      </div>
    </article>
  );
}

const AUTOPLAY_MS = 5000;
/** After the visitor swipes or clicks, hold autoplay off this long. */
const INTERACTION_PAUSE_MS = 8000;

/**
 * Carousel state over a scroll-snap track: which slide sits at the left edge,
 * how many positions there are, and moving between them. Scrolling stays
 * native (swipe, trackpad, keyboard); the arrows, dots and autoplay just
 * scroll the track.
 */
function useSnapCarousel(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [positions, setPositions] = useState(1);

  const step = useCallback(() => {
    const track = trackRef.current;
    const slide = track?.querySelector<HTMLElement>("[data-slide]");
    if (!track || !slide) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return slide.offsetWidth + gap;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const width = step();
    if (!track || !width) return;
    const visible = Math.max(1, Math.round(track.clientWidth / width));
    const total = Math.max(1, count - visible + 1);
    setPositions(total);
    setIndex(Math.min(total - 1, Math.round(track.scrollLeft / width)));
  }, [count, step]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track) return;
      const wrapped = ((next % positions) + positions) % positions;
      track.scrollTo({ left: wrapped * step(), behavior: "smooth" });
    },
    [positions, step],
  );

  return { trackRef, index, positions, goTo };
}

/**
 * Client reviews, read live from Majestan Realty's Google Business listing
 * (filtered server-side to well-rated, substantive ones), as a carousel:
 * one card per view on phones, two on tablets, three on desktop. Autoplays
 * and wraps; pauses on hover, focus or touch, and never autoplays for
 * reduced-motion users. Hidden entirely when Google returns nothing.
 */
export function GoogleReviewsSection({ data }: { data: GoogleReviews | null }) {
  const count = data?.reviews.length ?? 0;
  const { trackRef, index, positions, goTo } = useSnapCarousel(count);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interactedAt, setInteractedAt] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const paused = hovered || focused || reduceMotion || positions <= 1;

  useEffect(() => {
    if (paused) return;
    const wait = Math.max(AUTOPLAY_MS, interactedAt + INTERACTION_PAUSE_MS - Date.now());
    const t = setTimeout(() => {
      if (document.visibilityState === "visible") goTo(index + 1);
    }, wait);
    return () => clearTimeout(t);
  }, [paused, index, interactedAt, goTo]);

  if (!data || count === 0) return null;

  const userGo = (next: number) => {
    setInteractedAt(Date.now());
    goTo(next);
  };

  const arrowClass =
    "inline-flex! h-11! w-11! cursor-pointer! items-center! justify-center! rounded-full! border! border-solid! border-[#d0d5dd]! bg-white! text-[#101828]! transition-colors! duration-150! hover:border-[#27427f]! hover:bg-[#27427f]! hover:text-white! disabled:pointer-events-none! disabled:opacity-30!";

  return (
    <section className="font-manrope-page relative! w-full! bg-[#f8fafc]! py-20! md:py-24!" aria-labelledby="google-reviews-title">
      <div className="mx-auto! w-full! max-w-[1400px]! px-4! sm:px-6! md:px-8!">
        <div className="mb-10! flex! flex-col! gap-6! md:flex-row! md:items-end! md:justify-between!">
          <div className="max-w-2xl!">
            <h2
              id="google-reviews-title"
              className="m-0! font-['Lexend',sans-serif]! text-[clamp(30px,4vw,50px)]! font-light! leading-[1.1]! tracking-[-0.02em]! text-[#0a0a0a]!"
            >
              What our clients say
            </h2>
            <p className="m-0! mt-4! text-[15px]! font-normal! leading-relaxed! text-[#667085]! md:text-base!">
              Real reviews from buyers, sellers and tenants we&apos;ve worked with.
            </p>
          </div>

          <div className="flex! flex-wrap! items-center! gap-4!">
            {/* Rating summary */}
            <div className="flex! items-center! gap-4! rounded-2xl! border! border-solid! border-[#eaecf0]! bg-white! px-5! py-4!">
              <GoogleMark className="h-9! w-9!" />
              <div>
                <div className="flex! items-center! gap-2!">
                  <span className="text-[28px]! font-bold! leading-none! tracking-[-0.02em]! text-[#101828]! tabular-nums!">
                    {data.rating.toFixed(1)}
                  </span>
                  <Stars rating={data.rating} size={18} />
                </div>
                <p className="m-0! mt-1! text-[13px]! font-medium! text-[#667085]!">
                  Based on {data.total} Google review{data.total === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {positions > 1 && (
              <div className="hidden! items-center! gap-2! md:flex!">
                <button type="button" onClick={() => userGo(index - 1)} className={arrowClass} aria-label="Previous reviews">
                  <ChevronLeft size={20} />
                </button>
                <button type="button" onClick={() => userGo(index + 1)} className={arrowClass} aria-label="Next reviews">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client reviews"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
          }}
          onPointerDown={() => setInteractedAt(Date.now())}
          onWheel={() => setInteractedAt(Date.now())}
        >
          <div
            ref={trackRef}
            className="-mx-4! flex! snap-x! snap-mandatory! items-stretch! gap-4! overflow-x-auto! scroll-smooth! scroll-px-4! px-4! pt-1! pb-3! [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden! sm:-mx-6! sm:scroll-px-6! sm:px-6! md:mx-0! md:gap-5! md:scroll-px-0! md:px-0!"
          >
            {data.reviews.map((review) => (
              <ReviewCard key={`${review.authorName}-${review.time}`} review={review} />
            ))}
          </div>

          {positions > 1 && (
            <div className="mt-6! flex! items-center! justify-center! gap-2!">
              {Array.from({ length: positions }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => userGo(i)}
                  aria-label={`Go to review ${i + 1}`}
                  aria-current={i === index}
                  className="group/dot inline-flex! h-6! cursor-pointer! items-center! border-0! bg-transparent! p-0!"
                >
                  <span
                    className={`block! h-2! rounded-full! transition-[width,background-color]! duration-300! ease-out! ${
                      i === index ? "w-6! bg-[#27427f]!" : "w-2! bg-[#cbd5e1]! group-hover/dot:bg-[#94a3b8]!"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8! flex! flex-col! items-start! justify-between! gap-4! sm:flex-row! sm:items-center!">
          <p className="m-0! inline-flex! items-center! gap-2! text-[13px]! font-medium! text-[#667085]!">
            <GoogleMark className="h-4! w-4!" />
            Reviews from Google
          </p>
          <div className="flex! flex-wrap! items-center! gap-3!">
            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex! h-11! items-center! rounded-xl! border! border-solid! border-[#d0d5dd]! bg-white! px-5! text-[14px]! font-semibold! text-[#101828]! no-underline! transition-colors! duration-150! hover:border-[#27427f]! hover:text-[#27427f]!"
              >
                See all reviews
              </a>
            )}
            <a
              href={data.writeReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex! h-11! items-center! rounded-xl! bg-[#27427f]! px-5! text-[14px]! font-semibold! text-white! no-underline! transition-colors! duration-150! hover:bg-[#1e3366]!"
            >
              Write a review
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
