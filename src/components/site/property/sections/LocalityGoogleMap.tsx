"use client";

import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface LocalityGoogleMapProps {
  lat: number | null;
  lng: number | null;
  city: string;
  state?: string;
}

function InnerMap({ lat, lng, apiKey }: { lat: number, lng: number, apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-locality',
    googleMapsApiKey: apiKey,
  });

  if (loadError) {
    return <div className="!text-red-500 !text-sm">Failed to load Map</div>;
  }

  if (!isLoaded) {
    return <div className="!w-full !h-[400px] !bg-gray-100 dark:!bg-[#262730] !animate-pulse !rounded-[20px]" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '20px' }}
      center={{ lat, lng }}
      zoom={14}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      <MarkerF position={{ lat, lng }} />
    </GoogleMap>
  );
}

export function LocalityGoogleMap({ lat, lng, city, state }: LocalityGoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasValidMapKey = apiKey.length > 5;

  if (!hasValidMapKey || !lat || !lng) {
    return (
      <div className="w-full h-[400px] rounded-[20px]! border! border-gray-200! bg-gray-50/50! flex! flex-col! items-center! justify-center! text-center! hover:bg-gray-50! transition-colors!">
        <div className="w-20! h-20! rounded-full! bg-white! border! border-gray-200! flex! items-center! justify-center! mb-5!">
          <MapPin className="w-8! h-8! text-gray-400!" />
        </div>
        <h4 className="text-xl! font-medium! text-gray-900! mb-2!">
          {city}
          {state ? `, ${state}` : ""}
        </h4>
        <p className="text-gray-500! text-sm! font-light!">
          {!hasValidMapKey ? "Map unavailable (Missing API Key)" : "Map will be available once exact coordinates are provided."}
        </p>
      </div>
    );
  }

  return <InnerMap lat={lat} lng={lng} apiKey={apiKey} />;
}
