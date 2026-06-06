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
        <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
          <div className="flex! items-center! gap-4! mb-8!">
            <div className="w-14! h-14! rounded-[16px]! bg-[#27427f]/10! flex! items-center! justify-center!">
              <Camera className="w-6! h-6! text-[#27427f]!" />
            </div>
            <h2 className="text-2xl! md:text-3xl! font-extrabold! text-[#161e2d]! font-['Lexend',sans-serif]!">
              Photos
            </h2>
          </div>
          <div className="rounded-[24px]! border-2! border-dashed! border-gray-200! bg-gray-50/50! flex! flex-col! items-center! justify-center! py-24! text-center! hover:bg-gray-50! transition-colors!">
            <div className="w-24! h-24! rounded-[24px]! bg-white! border! border-gray-100! shadow-sm! flex! items-center! justify-center! mb-6!">
              <ImageOff className="w-10! h-10! text-gray-300!" />
            </div>
            <h3 className="text-xl! font-extrabold! text-[#161e2d]! mb-3! font-['Lexend',sans-serif]!">
              No photos available yet
            </h3>
            <p className="text-gray-500! text-base! max-w-md! leading-relaxed!">
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
      <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
        <div className="flex! items-center! justify-between!">
          <div className="flex! items-center! gap-4!">
            <div className="w-14! h-14! rounded-[16px]! bg-[#27427f]/10! flex! items-center! justify-center!">
              <Camera className="w-6! h-6! text-[#27427f]!" />
            </div>
            <div>
              <h2 className="text-2xl! md:text-3xl! font-extrabold! text-[#161e2d]! font-['Lexend',sans-serif]!">
                Photos
              </h2>
              <p className="text-sm! font-bold! text-gray-400! mt-1!">
                Browse all photos of {property.title}
              </p>
            </div>
          </div>
          <span className="inline-flex! items-center! gap-2! px-4! py-2.5! bg-[#27427f]/10! rounded-[12px]! text-sm! font-extrabold! text-[#27427f]! shadow-sm!">
            <Images className="w-4.5! h-4.5!" />
            {allImages.length} {allImages.length === 1 ? "Photo" : "Photos"}
          </span>
        </div>
      </div>

      {/* Primary Image */}
      {primaryImage && (
        <div className="bg-white! rounded-[32px]! p-3! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
          <div className="relative!">
            <span className="absolute! top-5! left-5! z-10! inline-flex! items-center! gap-1.5! px-4! py-2! bg-[#ffc900]! rounded-[10px]! text-xs! font-black! uppercase! tracking-widest! text-[#161e2d]! shadow-lg!">
              <Star className="w-4! h-4!" />
              Primary
            </span>
            <button
              onClick={() => openLightbox(0)}
              className="w-full! block! relative! rounded-[24px]! overflow-hidden! group! cursor-pointer!"
            >
              <img
                src={primaryImage.imageUrl}
                alt={`${property.title} - Primary`}
                className="w-full! h-[350px]! md:h-[550px]! object-cover! transition-transform! duration-700! group-hover:scale-105!"
              />
              <div className="absolute! inset-0! bg-black/0! group-hover:bg-black/20! transition-colors! duration-300! flex! items-center! justify-center!">
                <div className="opacity-0! group-hover:opacity-100! transition-all! duration-300! w-16! h-16! rounded-full! bg-white/90! backdrop-blur-md! flex! items-center! justify-center! shadow-2xl! scale-50! group-hover:scale-100!">
                  <ZoomIn className="w-6! h-6! text-[#161e2d]!" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {galleryImages.length > 0 && (
        <div className="bg-white! rounded-[32px]! p-3! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
          <div className="grid! grid-cols-2! md:grid-cols-3! lg:grid-cols-4! gap-3!">
            {galleryImages.map((img, idx) => {
              const imageIndex = primaryImage ? idx + 1 : idx;
              // Create varied grid sizes for masonry effect
              const isLarge = idx % 5 === 0;
              return (
                <button
                  key={img.id}
                  onClick={() => openLightbox(imageIndex)}
                  className={`relative! rounded-[20px]! overflow-hidden! group! cursor-pointer! ${
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
                  <div className="absolute! inset-0! bg-black/0! group-hover:bg-black/30! transition-colors! duration-300! flex! items-center! justify-center!">
                    <div className="opacity-0! group-hover:opacity-100! transition-all! duration-300! w-12! h-12! rounded-full! bg-white/90! backdrop-blur-md! flex! items-center! justify-center! shadow-2xl! scale-50! group-hover:scale-100!">
                      <ZoomIn className="w-5! h-5! text-[#161e2d]!" />
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
        <div className="fixed! inset-0! z-[9999]! bg-black/95! backdrop-blur-xl! flex! items-center! justify-center!">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute! top-6! right-6! z-10! w-14! h-14! rounded-full! bg-white/10! hover:bg-white/20! flex! items-center! justify-center! transition-colors! backdrop-blur-md!"
            aria-label="Close lightbox"
          >
            <X className="w-6! h-6! text-white!" />
          </button>

          {/* Image Counter */}
          <div className="absolute! top-6! left-6! z-10! px-5! py-3! bg-white/10! backdrop-blur-md! rounded-[12px]!">
            <span className="text-white! text-sm! font-bold! tracking-widest!">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute! left-6! z-10! w-16! h-16! rounded-full! bg-white/5! hover:bg-white/20! flex! items-center! justify-center! transition-all! backdrop-blur-md! hover:scale-110!"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8! h-8! text-white!" />
            </button>
          )}

          {/* Current Image */}
          <div className="max-w-[90vw]! max-h-[80vh]! flex! items-center! justify-center!">
            <img
              src={allImages[currentIndex].imageUrl}
              alt={`${property.title} - Image ${currentIndex + 1}`}
              className="max-w-full! max-h-[80vh]! object-contain! rounded-[16px]! select-none! shadow-[0_20px_60px_rgba(0,0,0,0.5)]!"
              draggable={false}
            />
          </div>

          {/* Next Button */}
          {allImages.length > 1 && (
            <button
              onClick={goNext}
              className="absolute! right-6! z-10! w-16! h-16! rounded-full! bg-white/5! hover:bg-white/20! flex! items-center! justify-center! transition-all! backdrop-blur-md! hover:scale-110!"
              aria-label="Next image"
            >
              <ChevronRight className="w-8! h-8! text-white!" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="absolute! bottom-6! left-1/2! -translate-x-1/2! flex! gap-3! max-w-[90vw]! overflow-x-auto! py-3! px-5! bg-black/40! backdrop-blur-xl! rounded-[24px]! hide-scrollbar! border! border-white/10!">
              {allImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-20! h-16! rounded-[12px]! overflow-hidden! shrink-0! border-2! transition-all! duration-300! ${
                    idx === currentIndex
                      ? "border-[#ffc900]! opacity-100! scale-110! shadow-lg!"
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
