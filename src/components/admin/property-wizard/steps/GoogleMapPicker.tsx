"use client";

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from '@react-google-maps/api';
import { Search } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 11.0168, // Default to Coimbatore
  lng: 76.9558
};

interface GoogleMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

function MapPickerInner({ initialLat, initialLng, onLocationSelect, apiKey }: GoogleMapPickerProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter
  );
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationSelect(lat, lng);
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPos = { lat, lng };
        setMarkerPosition(newPos);
        map?.panTo(newPos);
        map?.setZoom(15);
        onLocationSelect(lat, lng, place.formatted_address);
      }
    }
  };

  if (loadError) {
    return <div className="!h-[350px] !w-full !bg-red-50 dark:!bg-red-500/10 !text-red-500 !rounded-xl !flex !items-center !justify-center !p-6 !text-center">Failed to load Google Maps. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return <div className="!h-[350px] !w-full !bg-gray-100 dark:!bg-[#171821] !rounded-xl !animate-pulse !flex !items-center !justify-center !text-gray-400">Loading Map...</div>;
  }

  return (
    <div className="!space-y-4">
      <div className="!relative">
        <Autocomplete
          onLoad={(ac) => (autocompleteRef.current = ac)}
          onPlaceChanged={handlePlaceChanged}
        >
          <div className="!relative">
            <Search className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search for an address to drop pin..."
              className="!w-full !pl-10 !pr-4 !py-3 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-xl focus:!ring-2 focus:!ring-[#27427f]/40 !outline-none !text-gray-900 dark:!text-white"
            />
          </div>
        </Autocomplete>
      </div>

      <div className="!border !border-gray-200 dark:!border-[#262730] !rounded-xl !overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          <MarkerF
            position={markerPosition}
            draggable={true}
            onDragEnd={handleMapClick}
          />
        </GoogleMap>
      </div>
      <p className="!text-xs !text-gray-500">
        Drag the pin or click on the map to set the exact coordinates for this property.
      </p>
    </div>
  );
}

export function GoogleMapPicker(props: GoogleMapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasValidMapKey = apiKey.length > 5;
  
  if (!hasValidMapKey) {
    return (
      <div className="!h-[350px] !w-full !bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !flex !flex-col !items-center !justify-center !text-gray-500 !p-6 !text-center">
        <p className="!font-medium !mb-1">Google Maps API Key Missing</p>
        <p className="!text-sm !font-light">Please configure the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable to use the interactive map picker.</p>
      </div>
    );
  }

  return <MapPickerInner {...props} apiKey={apiKey} />;
}
