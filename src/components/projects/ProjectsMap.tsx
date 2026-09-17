"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { formatINR, type ProjectListItem } from "@/lib/api/projects";

const containerStyle = {
  width: "100%",
  height: "480px",
  borderRadius: "16px",
};

const FALLBACK_CENTER = { lat: 11.0168, lng: 76.9558 }; // Coimbatore

type Pin = {
  id: number;
  position: { lat: number; lng: number };
  item: ProjectListItem;
};

// Module-level cache so repeat filter changes don't re-geocode the same areas.
const geoCache = new Map<string, { lat: number; lng: number } | null>();

export function ProjectsMap({ items, city }: { items: ProjectListItem[]; city: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "projects-map-script",
    googleMapsApiKey: apiKey,
  });

  const [pins, setPins] = useState<Pin[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof google === "undefined") return;
    let cancelled = false;
    setLocating(true);
    setActiveId(null);

    // Keyless OpenStreetMap geocoding (the Google key has no Geocoding API
    // access). Unique queries only, staggered to respect the 1 req/sec policy.
    const geocodeOne = async (query: string): Promise<{ lat: number; lng: number } | null> => {
      const cached = geoCache.get(query);
      if (cached !== undefined) return cached;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`,
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`nominatim ${res.status}`);
        const rows = (await res.json()) as { lat?: string; lon?: string }[];
        const first = rows?.[0];
        const pos =
          first && Number.isFinite(Number(first.lat)) && Number.isFinite(Number(first.lon))
            ? { lat: Number(first.lat), lng: Number(first.lon) }
            : null;
        geoCache.set(query, pos);
        return pos;
      } catch {
        geoCache.set(query, null);
        return null;
      }
    };

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      const queries = items.map((item) =>
        [item.sublocation, item.city || city].filter(Boolean).join(", ")
      );
      const unique = [...new Set(queries.filter(Boolean))];
      for (let u = 0; u < unique.length; u++) {
        if (cancelled) return;
        if (!geoCache.has(unique[u])) {
          // eslint-disable-next-line no-await-in-loop
          await geocodeOne(unique[u]);
          // eslint-disable-next-line no-await-in-loop
          await sleep(1100);
        }
      }
      if (cancelled) return;

      const resolved: Pin[] = [];
      items.forEach((item, i) => {
        const query = queries[i];
        const pos = query ? geoCache.get(query) : null;
        if (pos) {
          // Deterministic micro-offset so same-area projects don't stack exactly.
          const jitter = (i % 5) * 0.0018;
          resolved.push({
            id: item.id,
            position: { lat: pos.lat + jitter, lng: pos.lng + jitter },
            item,
          });
        }
      });
      if (cancelled) return;
      setPins(resolved);
      setLocating(false);

      const map = mapRef.current;
      if (map && resolved.length > 0 && typeof google !== "undefined") {
        const bounds = new google.maps.LatLngBounds();
        resolved.forEach((p) => bounds.extend(p.position));
        map.fitBounds(bounds, 48);
        if (resolved.length === 1) map.setZoom(13);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, items, city]);

  if (!apiKey || apiKey.length < 5) {
    return (
      <div className="w-full! h-[240px]! rounded-2xl! bg-gray-50! border! border-gray-200! flex! flex-col! items-center! justify-center! text-gray-500! p-6! text-center!">
        <MapPin className="w-6! h-6! mb-2! text-gray-400!" />
        <p className="text-sm! font-medium!">Map unavailable</p>
        <p className="text-xs! font-light! mt-1!">Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the interactive map.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full! h-[240px]! rounded-2xl! bg-gray-50! border! border-gray-200! flex! flex-col! items-center! justify-center! text-gray-500! p-6! text-center!">
        <MapPin className="w-6! h-6! mb-2! text-gray-400!" />
        <p className="text-sm! font-medium!">Could not load the map</p>
        <p className="text-xs! font-light! mt-1!">Please check your connection and try again.</p>
      </div>
    );
  }

  const activePin = pins.find((p) => p.id === activeId) ?? null;
  const activePrice =
    activePin != null
      ? activePin.item.ranges.minPrice != null || activePin.item.ranges.maxPrice != null
        ? `${formatINR(activePin.item.ranges.minPrice)}${activePin.item.ranges.minPrice !== activePin.item.ranges.maxPrice && activePin.item.ranges.maxPrice != null ? ` - ${formatINR(activePin.item.ranges.maxPrice)}` : ""}`
        : "Price on Request"
      : "";

  return (
    <div className="w-full! rounded-2xl! overflow-hidden! border! border-gray-200/70! shadow-sm! bg-white!">
      <div className="flex! items-center! justify-between! px-4! py-3!">
        <p className="text-[13px]! font-bold! text-gray-800!">
          Project locations
          <span className="ml-1.5! font-medium! text-gray-400! tabular-nums!">
            {pins.length > 0 ? `(${pins.length})` : ""}
          </span>
        </p>
        {locating && <p className="text-[11px]! text-gray-400! animate-pulse!">Locating…</p>}
      </div>
      <div className="relative!">
        {!isLoaded ? (
          <div className="w-full! h-[480px]! bg-gray-100! animate-pulse!" style={{ borderRadius: "0 0 16px 16px" }} />
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={FALLBACK_CENTER}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={() => setActiveId(null)}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {pins.map((pin) => (
              <MarkerF
                key={pin.id}
                position={pin.position}
                title={pin.item.name}
                onClick={() => setActiveId(pin.id)}
                icon={
                  typeof google !== "undefined"
                    ? {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 11,
                        fillColor: pin.id === activeId ? "#ffc900" : "#27427f",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2.5,
                      }
                    : undefined
                }
              />
            ))}
            {activePin && (
              <InfoWindowF position={activePin.position} onCloseClick={() => setActiveId(null)}>
                <div className="min-w-[180px]! max-w-[230px]! p-1!">
                  <p className="text-[13px]! font-bold! text-gray-900! leading-snug!">{activePin.item.name}</p>
                  <p className="text-[11px]! text-gray-500! mt-0.5!">
                    {[activePin.item.sublocation, activePin.item.city].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-[13px]! font-bold! text-[#27427f]! mt-1.5!">{activePrice}</p>
                  <Link
                    href={`/${activePin.item.canonicalSlug}`}
                    className="inline-block! mt-2! text-[12px]! font-bold! text-[#27427f]! hover:text-[#1a2d59]! no-underline!"
                  >
                    View project →
                  </Link>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
