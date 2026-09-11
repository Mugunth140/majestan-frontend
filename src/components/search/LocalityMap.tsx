"use client";

export function LocalityMap({ city, locality }: { city: string; locality?: string }) {
  const query = locality && locality.trim() ? `${locality.trim()}, ${city}` : city;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;

  return (
    <div className="relative! w-full! h-[240px]! rounded-xl! overflow-hidden! border! border-gray-200/70! bg-gray-100!">
      <iframe
        key={query}
        title={`Map of ${query}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute! inset-0! w-full! h-full! border-0! pointer-events-none!"
      />
    </div>
  );
}
