"use client";

type Props = {
  /** Address query to show, e.g. "Saravanampatti, Coimbatore". */
  query: string;
  /** Label used for the frame title. */
  label: string;
  height?: number;
};

/**
 * Real, fully interactive Google Map via the keyless embed endpoint —
 * pan/zoom works out of the box and needs no Geocoding API access.
 */
export function LocalityInteractiveMap({ query, label, height = 320 }: Props) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;

  return (
    <div className="relative! w-full! rounded-xl! overflow-hidden! border! border-gray-100! bg-gray-100!" style={{ height }}>
      <iframe
        key={query}
        title={`Map of ${label}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute! inset-0! w-full! h-full! border-0!"
      />
    </div>
  );
}
