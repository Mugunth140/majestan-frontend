"use client";

import { useState, useEffect, useCallback } from "react";
import { type SeoProperty } from "@/lib/api/property-by-slug";
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  ImageOff,
  Images,
  ZoomIn,
} from "lucide-react";

type PhotosSectionProps = {
  property: SeoProperty;
};

export function PhotosSection({ property }: PhotosSectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = property.images ?? [];
  const primaryImage = images.find((img) => img.isPrimary);
  const galleryImages = images.filter((img) => !img.isPrimary);

  // Order: primary first, then gallery
  const allImages = primaryImage
    ? [primaryImage, ...galleryImages]
    : [...galleryImages];

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  // Empty state
  if (allImages.length === 0) {
    return (
      <div className="space-y-8!">
        <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
          <div className="flex! items-center! gap-4! mb-8!">
            <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
              <Camera className="w-6! h-6! text-gray-600!" />
            </div>
            <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900!">
              Photos
            </h2>
          </div>
          <div className="rounded-[20px]! border! border-gray-200! bg-gray-50/50! flex! flex-col! items-center! justify-center! py-24! text-center! hover:bg-gray-50! transition-colors!">
            <div className="w-20! h-20! rounded-full! bg-white! border! border-gray-200! flex! items-center! justify-center! mb-6!">
              <ImageOff className="w-8! h-8! text-gray-400!" />
            </div>
            <h3 className="text-xl! font-medium! text-gray-900! mb-2!">
              No photos available yet
            </h3>
            <p className="text-gray-500! text-base! font-light! max-w-md! leading-relaxed!">
              Photos for this property are being uploaded. Check back soon or contact
              the owner for a virtual tour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8!">
      {/* Header */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! flex-col! sm:flex-row! items-start! sm:items-center! justify-between! gap-4!">
          <div className="flex! items-center! gap-4!">
            <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
              <Camera className="w-6! h-6! text-gray-600!" />
            </div>
            <div>
              <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900!">
                Photos
              </h2>
              <p className="text-sm! font-normal! text-gray-500! mt-1!">
                Browse all photos of {property.title}
              </p>
            </div>
          </div>
          <span className="inline-flex! items-center! gap-2! px-4! py-2.5! bg-white! border! border-gray-200! rounded-full! text-sm! font-medium! text-gray-600!">
            <Images className="w-4.5! h-4.5!" />
            {allImages.length} {allImages.length === 1 ? "Photo" : "Photos"}
          </span>
        </div>
      </div>

      {/* Primary Image */}
      {primaryImage && (
        <div className="bg-white! rounded-[24px]! p-2! md:p-3! border! border-gray-200! shadow-sm!">
          <div className="relative!">
            <span className="absolute! top-5! left-5! z-10! inline-flex! items-center! gap-1.5! px-3! py-1.5! bg-white/95! backdrop-blur-md! border! border-gray-200/50! rounded-full! text-xs! font-medium! uppercase! tracking-widest! text-gray-900! shadow-sm!">
              <Star className="w-3.5! h-3.5!" />
              Primary
            </span>
            <button
              onClick={() => openLightbox(0)}
              className="w-full! block! relative! rounded-[20px]! overflow-hidden! group! cursor-pointer!"
            >
              <img
                src={primaryImage.imageUrl}
                alt={`${property.title} - Primary`}
                className="w-full! h-[350px]! md:h-[550px]! object-cover! transition-transform! duration-700! group-hover:scale-105!"
              />
              <div className="absolute! inset-0! bg-black/0! group-hover:bg-black/10! transition-colors! duration-300! flex! items-center! justify-center!">
                <div className="opacity-0! group-hover:opacity-100! transition-all! duration-300! w-14! h-14! rounded-full! bg-white/95! backdrop-blur-md! flex! items-center! justify-center! shadow-lg! scale-50! group-hover:scale-100!">
                  <ZoomIn className="w-5! h-5! text-gray-900!" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {galleryImages.length > 0 && (
        <div className="bg-white! rounded-[24px]! p-2! md:p-3! border! border-gray-200! shadow-sm!">
          <div className="grid! grid-cols-2! md:grid-cols-3! lg:grid-cols-4! gap-2! md:gap-3!">
            {galleryImages.map((img, idx) => {
              const imageIndex = primaryImage ? idx + 1 : idx;
              // Create varied grid sizes for masonry effect
              const isLarge = idx % 5 === 0;
              return (
                <button
                  key={img.id}
                  onClick={() => openLightbox(imageIndex)}
                  className={`relative! rounded-[16px]! overflow-hidden! group! cursor-pointer! ${
                    isLarge ? "md:col-span-2! md:row-span-2!" : ""
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`${property.title} - View ${idx + 2}`}
                    className={`w-full! object-cover! transition-transform! duration-700! group-hover:scale-110! ${
                      isLarge ? "h-[240px]! md:h-[400px]!" : "h-[180px]! md:h-[195px]!"
                    }`}
                  />
                  <div className="absolute! inset-0! bg-black/0! group-hover:bg-black/10! transition-colors! duration-300! flex! items-center! justify-center!">
                    <div className="opacity-0! group-hover:opacity-100! transition-all! duration-300! w-12! h-12! rounded-full! bg-white/95! backdrop-blur-md! flex! items-center! justify-center! shadow-lg! scale-50! group-hover:scale-100!">
                      <ZoomIn className="w-4.5! h-4.5! text-gray-900!" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed! inset-0! z-[9999]! bg-white/95! backdrop-blur-xl! flex! items-center! justify-center!">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute! top-6! right-6! z-10! w-12! h-12! rounded-full! bg-gray-100/50! hover:bg-gray-200/50! flex! items-center! justify-center! transition-colors! backdrop-blur-md!"
            aria-label="Close lightbox"
          >
            <X className="w-5! h-5! text-gray-900!" />
          </button>

          {/* Image Counter */}
          <div className="absolute! top-6! left-6! z-10! px-4! py-2! bg-gray-100/50! backdrop-blur-md! rounded-full!">
            <span className="text-gray-900! text-sm! font-medium! tracking-widest!">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
               onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute! left-6! z-10! w-14! h-14! rounded-full! bg-gray-100/50! hover:bg-gray-200/50! flex! items-center! justify-center! transition-all! backdrop-blur-md! hover:scale-105!"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6! h-6! text-gray-900!" />
            </button>
          )}

          {/* Current Image */}
          <div className="max-w-[90vw]! max-h-[80vh]! flex! items-center! justify-center!">
            <img
              src={allImages[currentIndex].imageUrl}
              alt={`${property.title} - Image ${currentIndex + 1}`}
              className="max-w-full! max-h-[80vh]! object-contain! rounded-[16px]! select-none! shadow-sm! border! border-gray-200!"
              draggable={false}
            />
          </div>

          {/* Next Button */}
          {allImages.length > 1 && (
            <button
               onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute! right-6! z-10! w-14! h-14! rounded-full! bg-gray-100/50! hover:bg-gray-200/50! flex! items-center! justify-center! transition-all! backdrop-blur-md! hover:scale-105!"
              aria-label="Next image"
            >
              <ChevronRight className="w-6! h-6! text-gray-900!" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="absolute! bottom-6! left-1/2! -translate-x-1/2! flex! gap-2! max-w-[90vw]! overflow-x-auto! py-2! px-4! bg-white/50! backdrop-blur-xl! rounded-[16px]! hide-scrollbar! border! border-gray-200!">
              {allImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`w-16! h-12! rounded-[8px]! overflow-hidden! shrink-0! border-2! transition-all! duration-300! ${
                    idx === currentIndex
                      ? "border-gray-900! opacity-100! scale-105! shadow-sm!"
                      : "border-transparent! opacity-40! hover:opacity-100!"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="w-full! h-full! object-cover!"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
