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
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#27427f]/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#27427f]" />
            </div>
            <h2 className="text-2xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              Photos
            </h2>
          </div>
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <ImageOff className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-[#161e2d] mb-2 font-['Lexend',sans-serif]">
              No photos available yet
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              Photos for this property are being uploaded. Check back soon or contact
              the owner for a virtual tour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#27427f]/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#27427f]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
                Photos
              </h2>
              <p className="text-sm text-gray-400">
                Browse all photos of {property.title}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#27427f]/10 rounded-lg text-sm font-bold text-[#27427f]">
            <Images className="w-4 h-4" />
            {allImages.length} {allImages.length === 1 ? "Photo" : "Photos"}
          </span>
        </div>
      </div>

      {/* Primary Image */}
      {primaryImage && (
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <div className="relative">
            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffc900] rounded-lg text-xs font-bold text-[#161e2d] shadow-sm">
              <Star className="w-3.5 h-3.5" />
              Primary
            </span>
            <button
              onClick={() => openLightbox(0)}
              className="w-full block relative rounded-xl overflow-hidden group cursor-pointer"
            >
              <img
                src={primaryImage.imageUrl}
                alt={`${property.title} - Primary`}
                className="w-full h-[300px] md:h-[460px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <ZoomIn className="w-5 h-5 text-[#161e2d]" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {galleryImages.length > 0 && (
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img, idx) => {
              const imageIndex = primaryImage ? idx + 1 : idx;
              // Create varied grid sizes for masonry effect
              const isLarge = idx % 5 === 0;
              return (
                <button
                  key={img.id}
                  onClick={() => openLightbox(imageIndex)}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                    isLarge ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`${property.title} - View ${idx + 2}`}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isLarge ? "h-[240px] md:h-[380px]" : "h-[180px] md:h-[180px]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <ZoomIn className="w-4 h-4 text-[#161e2d]" />
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
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Current Image */}
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
            <img
              src={allImages[currentIndex].imageUrl}
              alt={`${property.title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
              draggable={false}
            />
          </div>

          {/* Next Button */}
          {allImages.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4 bg-black/40 backdrop-blur-sm rounded-xl hide-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === currentIndex
                      ? "border-[#ffc900] opacity-100 scale-105"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
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
