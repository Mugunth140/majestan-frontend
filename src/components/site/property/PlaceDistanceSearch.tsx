// site/majestan-frontend/src/components/site/property/PlaceDistanceSearch.tsx
"use client";

import { useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Search } from "lucide-react";
import {
  formatDistanceKm,
  geocodeAddress,
  haversineKm,
  resolvePropertyCenter,
  type LatLng,
} from "@/lib/locality-geo";

type PlaceDistanceSearchProps = {
  lat: string | number | null;
  lng: string | number | null;
  locality: string | null;
  city: string;
  state?: string | null;
};

type SearchState =
  | { status: "idle" }
  | { status: "working" }
  | { status: "done"; place: string; km: number; approximate: boolean }
  | { status: "error"; message: string };

/**
 * Search bar measuring how far a searched place is from this property.
 * Origin is the exact coordinates when stored, else the geocoded locality;
 * the destination is geocoded on submit and the gap is straight-line.
 */
export function PlaceDistanceSearch({ lat, lng, locality, city, state }: PlaceDistanceSearchProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-locality',
    googleMapsApiKey: apiKey,
  });
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });

  if (!apiKey || apiKey.length <= 5) return null;

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = query.trim();
    if (!text || typeof google === "undefined" || !google.maps?.Geocoder) return;
    setSearch({ status: "working" });
    try {
      const geocoder = new google.maps.Geocoder();
      const origin = await resolvePropertyCenter(
        { lat, lng, locality, city, state },
        (address) => geocodeAddress(geocoder, address),
      );
      if (!origin) {
        setSearch({ status: "error", message: "Couldn't locate this property." });
        return;
      }
      const target = await geocodeAddress(
        geocoder,
        [text, city, (state ?? '').trim()].filter(Boolean).join(', '),
      );
      if (!target) {
        setSearch({ status: "error", message: "Couldn't find that place — try another search." });
        return;
      }
      const km = haversineKm(origin.lat, origin.lng, (target as LatLng).lat, (target as LatLng).lng);
      setSearch({ status: "done", place: text, km, approximate: origin.approximate });
    } catch {
      setSearch({ status: "error", message: "Search failed — please try again." });
    }
  };

  return (
    <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
      <h3 className="font-manrope! text-lg! md:text-xl! font-medium! text-gray-900!">
        Search your favourite place from this property
      </h3>
      <form onSubmit={runSearch} className="mt-4! flex! flex-col! sm:flex-row! gap-3!">
        <div className="relative! flex-1!">
          <Search className="w-4! h-4! text-gray-400! absolute! left-4! top-1/2! -translate-y-1/2! pointer-events-none!" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a place, landmark or area…"
            aria-label="Search a place"
            className="w-full! h-12! pl-11! pr-4! rounded-xl! bg-gray-50! border! border-gray-200! text-[15px]! text-gray-900! placeholder-gray-400! outline-none! focus:bg-white! focus:border-[#27427f]/40! focus:ring-2! focus:ring-[#27427f]/15! transition-all!"
          />
        </div>
        <button
          type="submit"
          disabled={!isLoaded || search.status === "working"}
          className="h-12! px-6! rounded-xl! bg-[#27427f]! text-white! font-manrope! font-medium! text-[15px]! hover:bg-[#1e3366]! transition-all! shrink-0! cursor-pointer! disabled:opacity-50! disabled:cursor-wait!"
        >
          {search.status === "working" ? "Searching…" : "Check distance"}
        </button>
      </form>
      {search.status === "done" && (
        <div className="mt-4! flex! items-center! justify-between! gap-4! rounded-xl! bg-[#27427f]/5! border! border-[#27427f]/15! px-4! py-3!">
          <div className="flex! items-center! gap-3! min-w-0!">
            <MapPin className="w-5! h-5! text-[#27427f]! shrink-0!" />
            <div className="min-w-0!">
              <p className="font-manrope! font-semibold! text-[15px]! text-gray-900! truncate!">
                {search.place}
              </p>
              <p className="text-xs! text-gray-500! font-normal! mt-0.5!">
                {search.approximate ? "from the locality centre" : "from this property"}
              </p>
            </div>
          </div>
          <span className="inline-flex! items-center! px-3! py-1.5! rounded-full! bg-[#27427f]! text-white! text-sm! font-manrope! font-semibold! whitespace-nowrap! shrink-0!">
            {formatDistanceKm(search.km)}
          </span>
        </div>
      )}
      {search.status === "error" && (
        <p className="mt-4! text-[15px]! text-red-600!">{search.message}</p>
      )}
    </div>
  );
}
