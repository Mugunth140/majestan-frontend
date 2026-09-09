"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectDetail } from "@/lib/api/projects";

export function ProjectPhotosSection({ project }: { project: ProjectDetail }) {
  const images = [project.coverImageUrl, ...(project.galleryImageUrls ?? [])].filter(Boolean) as string[];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const close = useCallback(() => setLightboxOpen(false), []);
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length, close]);

  if (images.length === 0) return null;
  const open = (i: number) => { setCurrentIndex(i); setLightboxOpen(true); };

  return (
    <section id="photos" className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-6! md:p-8! scroll-mt-40!">
      <h2 className="text-xl! md:text-2xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-5!">
        Photos <span className="text-sm! font-semibold! text-gray-400!">({images.length})</span>
      </h2>
      <div className="grid! grid-cols-2! md:grid-cols-3! gap-4!">
        {images.map((src, i) => (
          <button key={i} onClick={() => open(i)} className="aspect-[4/3]! bg-gray-100! rounded-xl! overflow-hidden! cursor-pointer! group!">
            <img src={src} alt={`${project.name} photo ${i + 1}`} className="w-full! h-full! object-cover! group-hover:scale-105! transition-transform! duration-500!" loading="lazy" />
          </button>
        ))}
      </div>
      {lightboxOpen && (
        <div className="fixed! inset-0! z-[100]! bg-black/90! flex! items-center! justify-center! p-4!" onClick={close}>
          <button className="absolute! top-4! right-6! text-white! text-3xl! cursor-pointer!" onClick={close} aria-label="Close">×</button>
          <button className="absolute! left-4! text-white! text-4xl! cursor-pointer!" onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + images.length) % images.length); }} aria-label="Previous">‹</button>
          <img src={images[currentIndex]} alt={`${project.name} photo ${currentIndex + 1}`} className="max-h-[85vh]! max-w-full! object-contain! rounded-lg!" onClick={(e) => e.stopPropagation()} />
          <button className="absolute! right-4! text-white! text-4xl! cursor-pointer!" onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % images.length); }} aria-label="Next">›</button>
          <span className="absolute! bottom-4! text-white! text-sm! font-semibold!">{currentIndex + 1} / {images.length}</span>
        </div>
      )}
    </section>
  );
}
