"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { ListingImage } from "@/components/site/listing/ListingImage";
import type { ProjectVideo } from "@/lib/youtube";
import { YouTubeFacade } from "@/components/site/project/overview/YouTubeFacade";
import { FOCUS_RING, MUTED } from "@/components/site/project/overview/overview-ui";

/** Small tiles beside the lead cell: two rows of two. */
const SMALL_TILES = 4;

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * One mosaic for photos and videos. The first video takes the large cell and
 * plays in place; photos fill the cells beside it, and every photo leads to
 * the gallery, where the lightbox lives. With no video, the cover photo takes
 * the large cell instead.
 */
export function MediaShowcase({
  slug,
  name,
  photos,
  videos,
  placeholder,
}: {
  slug: string;
  name: string;
  photos: string[];
  videos: ProjectVideo[];
  placeholder: string;
}) {
  const leadVideo = videos[0] ?? null;
  const leadPhoto = leadVideo ? null : photos[0] ?? null;
  const pool = leadVideo ? photos : photos.slice(1);
  const small = pool.slice(0, SMALL_TILES);
  const hiddenPhotos = pool.length - small.length;
  const moreVideos = videos.length - 1;
  const hasSmall = small.length > 0;

  return (
    <div className="mt-6!">
      <div className={`grid! grid-cols-2! gap-2.5! ${hasSmall ? "sm:grid-cols-4! sm:grid-rows-2!" : ""}`}>
        <div className={`col-span-2! min-w-0! ${hasSmall ? "sm:row-span-2!" : ""}`}>
          {leadVideo ? (
            <YouTubeFacade videoId={leadVideo.id} title={leadVideo.title ?? `${name} video`} />
          ) : (
            leadPhoto && (
              <PhotoTile slug={slug} src={leadPhoto} alt={`${name} photo 1`} placeholder={placeholder} className="aspect-video!" />
            )
          )}
        </div>
        {small.map((src, i) => {
          const last = i === small.length - 1 && hiddenPhotos > 0;
          return (
            <PhotoTile
              key={`${src}-${i}`}
              slug={slug}
              src={src}
              alt={`${name} photo ${i + (leadVideo ? 1 : 2)}`}
              placeholder={placeholder}
              className="aspect-[4/3]! sm:aspect-auto!"
              overlay={last ? `+${hiddenPhotos} ${plural(hiddenPhotos, "photo", "photos")}` : undefined}
            />
          );
        })}
      </div>

      {(leadVideo?.title || moreVideos > 0) && (
        <div className="mt-3! flex! flex-wrap! items-center! justify-between! gap-x-4! gap-y-1!">
          {leadVideo?.title ? (
            <p className={`m-0! flex! items-center! gap-1.5! text-sm! ${MUTED}`}>
              <PlayCircle className="w-4! h-4! text-[var(--ov-blue)]!" aria-hidden="true" />
              {leadVideo.title}
            </p>
          ) : (
            <span />
          )}
          {moreVideos > 0 && (
            <Link
              href={`/${slug}/photos#videos`}
              className="text-sm! font-semibold! text-[var(--ov-blue-deep)]! underline! decoration-[#bcd0f7]! underline-offset-4! hover:decoration-[var(--ov-blue-deep)]!"
            >
              +{moreVideos} more {plural(moreVideos, "video", "videos")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function PhotoTile({
  slug,
  src,
  alt,
  placeholder,
  className,
  overlay,
}: {
  slug: string;
  src: string;
  alt: string;
  placeholder: string;
  className: string;
  overlay?: string;
}) {
  return (
    <Link
      href={`/${slug}/photos`}
      className={`group/tile relative! block! min-h-0! overflow-hidden! rounded-xl! bg-[var(--ov-sky)]! ${FOCUS_RING} ${className}`}
    >
      <span className="absolute! inset-0! block! transition-transform! duration-500! ease-out-quint! group-hover/tile:scale-[1.04]!">
        <ListingImage src={src} placeholderSrc={placeholder} alt={alt} className="w-full! h-full! object-cover!" />
      </span>
      {overlay && (
        <span className="absolute! inset-0! grid! place-items-center! bg-[linear-gradient(135deg,rgba(22,69,191,0.78),rgba(10,15,28,0.7))]! text-sm! font-semibold! text-white!">
          {overlay}
        </span>
      )}
    </Link>
  );
}
