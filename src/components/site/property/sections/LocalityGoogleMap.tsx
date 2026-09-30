"use client";

import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { buildGeocodeQuery } from '@/lib/locality-geo';

interface LocalityGoogleMapProps {
  lat: number | string | null;
  lng: number | string | null;
  city: string;
  state?: string;
  /** Locality name (e.g. "Rs puram") — geocoded when exact coords are missing. */
  locality?: string | null;
}

function MapUnavailable({ city, state, missingKey }: { city: string; state?: string; missingKey: boolean }) {
  return (
    <div className="w-full h-[400px] bg-gray-50/50! flex! flex-col! items-center! justify-center! text-center! hover:bg-gray-50! transition-colors!">
      <div className="w-20! h-20! rounded-full! bg-white! border! border-gray-200! flex! items-center! justify-center! mb-5!">
        <MapPin className="w-8! h-8! text-gray-400!" />
      </div>
      <h4 className="text-xl! font-medium! text-gray-900! mb-2!">
        {city}
        {state ? `, ${state}` : ""}
      </h4>
      <p className="text-gray-500! text-sm! font-normal!">
        {!missingKey ? "Map will be available once exact coordinates are provided." : "Map unavailable (Missing API Key)"}
      </p>
    </div>
  );
}

function InnerMap({ lat, lng, apiKey, zoom = 14, markerTitle }: { lat: number; lng: number; apiKey: string; zoom?: number; markerTitle?: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-locality',
    googleMapsApiKey: apiKey,
  });

  if (loadError) {
    return <div className="!text-red-500 !text-sm">Failed to load Map</div>;
  }

  if (!isLoaded) {
    return <div className="!w-full !h-[400px] !bg-gray-100 dark:!bg-[#262730] !animate-pulse" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '0' }}
      center={{ lat, lng }}
      zoom={zoom}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      <MarkerF position={{ lat, lng }} title={markerTitle} />
    </GoogleMap>
  );
}

/**
 * No exact coordinates: geocode the locality and show that area instead of
 * the unavailable message. Any failure (denied key, no match, unmounted)
 * falls back to the message — the page never breaks on this path.
 */
function GeocodedMap({ query, city, state, apiKey }: { query: string; city: string; state?: string; apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-locality',
    googleMapsApiKey: apiKey,
  });
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (typeof google === 'undefined' || !google.maps?.Geocoder) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    new google.maps.Geocoder().geocode({ address: query }, (results, status) => {
      if (cancelled) return;
      const location = results?.[0]?.geometry?.location;
      if (status === 'OK' && location) {
        setCenter({ lat: location.lat(), lng: location.lng() });
      } else {
        setFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, query]);

  if (loadError || failed) {
    return <MapUnavailable city={city} state={state} missingKey={false} />;
  }

  if (!isLoaded || !center) {
    return <div className="!w-full !h-[400px] !bg-gray-100 dark:!bg-[#262730] !animate-pulse" />;
  }

  return <InnerMap lat={center.lat} lng={center.lng} apiKey={apiKey} zoom={13} markerTitle="Approximate location" />;
}

export function LocalityGoogleMap({ lat, lng, city, state, locality }: LocalityGoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasValidMapKey = apiKey.length > 5;

  if (lat && lng) {
    return <InnerMap lat={Number(lat)} lng={Number(lng)} apiKey={apiKey} />;
  }

  if (!hasValidMapKey) {
    return <MapUnavailable city={city} state={state} missingKey />;
  }

  return (
    <GeocodedMap
      query={buildGeocodeQuery(locality, city, state)}
      city={city}
      state={state}
      apiKey={apiKey}
    />
  );
}
