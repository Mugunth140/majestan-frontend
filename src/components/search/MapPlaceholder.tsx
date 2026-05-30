"use client";

import { MapPin } from "lucide-react";

export function MapPlaceholder({ city, locality }: { city: string; locality?: string }) {
  const locationLabel = locality ? `${locality}, ${city}` : city;

  return (
    <div className="relative! w-full! h-full! bg-[#eef2f9]! flex! items-center! justify-center! overflow-hidden!">
      {/* Background Grid Pattern */}
      <div 
        className="absolute! inset-0! opacity-20!" 
        style={{
          backgroundImage: `linear-gradient(#27427f 1px, transparent 1px), linear-gradient(90deg, #27427f 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Map Pins Simulation */}
      <div className="absolute! inset-0! flex! items-center! justify-center!">
        <div className="relative! w-64! h-64!">
          {/* Main Pin */}
          <div className="absolute! top-1/2! left-1/2! -translate-x-1/2! -translate-y-1/2! z-10! flex! flex-col! items-center! animate-bounce!">
            <div className="bg-[#27427f]! text-white! px-3! py-1.5! rounded-lg! text-xs! font-bold! shadow-lg! mb-1! whitespace-nowrap!">
              {locationLabel}
            </div>
            <MapPin className="w-8! h-8! text-[#27427f]! fill-white!" />
          </div>
          
          {/* Decorative smaller pins */}
          <div className="absolute! top-8! left-10! opacity-60!">
            <MapPin className="w-5! h-5! text-[#ffc900]! fill-white!" />
          </div>
          <div className="absolute! bottom-12! left-4! opacity-40!">
            <MapPin className="w-5! h-5! text-[#ffc900]! fill-white!" />
          </div>
          <div className="absolute! top-16! right-8! opacity-50!">
            <MapPin className="w-5! h-5! text-[#ffc900]! fill-white!" />
          </div>
          <div className="absolute! bottom-16! right-12! opacity-70!">
            <MapPin className="w-5! h-5! text-[#ffc900]! fill-white!" />
          </div>
        </div>
      </div>

      {/* Overlay Message */}
      <div className="absolute! bottom-0! left-0! right-0! bg-gradient-to-t! from-white/90! to-transparent! pt-20! pb-6! px-6! text-center! backdrop-blur-[2px]!">
        <h3 className="font-bold! text-[#27427f]! mb-1!">Interactive Map View</h3>
        <p className="text-xs! text-gray-500!">Will be available soon with live property locations.</p>
      </div>
    </div>
  );
}
