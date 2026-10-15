import Link from "next/link";
import { Panel, PanelLink } from "@/components/site/project/overview/overview-ui";
import type { SeoPropertyImage } from "@/lib/api/property-by-slug";

type PhotosTeaserProps = {
  /** Real listing photos only — never the hero fallback. Empty renders nothing. */
  images: SeoPropertyImage[];
  title: string;
  photosHref: string;
};

/**
 * Overview teaser for the photos sub-page: up to three tiles, primary first
 * (the same ordering rule as the sub-page), with a "+N" overlay when more
 * remain. The whole strip links through to the gallery.
 */
export function PhotosTeaser({ images, title, photosHref }: PhotosTeaserProps) {
  if (!images || images.length === 0) return null;

  const primary = images.find((img) => img.isPrimary);
  const ordered = primary ? [primary, ...images.filter((img) => img !== primary)] : [...images];
  const visible = ordered.slice(0, 3);
  const overflow = ordered.length - visible.length;

  const gridClass =
    visible.length >= 3 ? "grid-cols-3!" : visible.length === 2 ? "grid-cols-2!" : "grid-cols-1!";
  const tileClass = visible.length === 1 ? "aspect-[16/9]!" : "aspect-square!";

  return (
    <Panel id="photos-preview" title="Photos" meta={`${images.length} ${images.length === 1 ? "photo" : "photos"}`}
      action={<PanelLink href={photosHref}>View All</PanelLink>}>
      <Link
        href={photosHref}
        aria-label="View all photos"
        className={`mt-6! pt-6! border-t! border-gray-100! grid! ${gridClass} gap-3! no-underline!`}
      >
        {visible.map((img, i) => (
          <div
            key={img.id}
            className={`relative! rounded-xl! overflow-hidden! ${tileClass} bg-gray-50!`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={`${title} — photo ${i + 1}`}
              className="w-full! h-full! object-cover!"
              loading="lazy"
            />
            {i === visible.length - 1 && overflow > 0 && (
              <div className="absolute! inset-0! bg-black/55! flex! items-center! justify-center!">
                <span className="text-white! text-xl! font-semibold!">+{overflow}</span>
              </div>
            )}
          </div>
        ))}
      </Link>
    </Panel>
  );
}
