"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getCities, type City } from "@/lib/api";

interface LocationContextType {
  location: string;
  setLocation: (city: string) => void;
  cities: City[];
  isLoadingCities: boolean;
  isLocating: boolean;
  updateLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState("Coimbatore");
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      try {
        const availableCities = await getCities(controller.signal);
        if (controller.signal.aborted) return;

        setCities(availableCities);

        const stored = localStorage.getItem("majestan_city");
        const storedCity = availableCities.find(
          (item) => item.city.toLowerCase() === stored?.toLowerCase(),
        );
        const defaultCity =
          availableCities.find(
            (item) => item.city.toLowerCase() === "coimbatore",
          ) ?? availableCities[0];

        if (storedCity) {
          setLocation(storedCity.city);
        } else if (defaultCity) {
          setLocation(defaultCity.city);
          localStorage.setItem("majestan_city", defaultCity.city);
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("Failed to load cities", error);
      } finally {
        if (!controller.signal.aborted) setIsLoadingCities(false);
      }
    }

    loadCities();
    return () => {
      controller.abort();
    };
  }, []);

  const handleSetLocation = (city: string) => {
    const configuredCity = cities.find(
      (item) => item.city.toLowerCase() === city.trim().toLowerCase(),
    );
    const nextCity = configuredCity?.city ?? city.trim();
    if (!nextCity) return;

    setLocation(nextCity);
    try {
      localStorage.setItem("majestan_city", nextCity);
      localStorage.setItem("majestan-location", nextCity);
      window.dispatchEvent(
        new CustomEvent("majestan-location-changed", { detail: nextCity }),
      );
    } catch {}
  };

  const updateLocation = async () => {
    setIsLocating(true);
    
    const fallbackToIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const detectedCity = cities.find(
          (item) => item.city.toLowerCase() === data.city?.toLowerCase(),
        );
        if (detectedCity) {
          handleSetLocation(detectedCity.city);
        } else {
          console.warn("Detected city is not available on Majestan.");
        }
      } catch (err) {
        console.error("IP fallback error:", err);
      } finally {
        setIsLocating(false);
      }
    };

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser, using fallback.");
      await fallbackToIP();
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const detectedName =
              data.address.city || data.address.town || data.address.village;
            const detectedCity = cities.find(
              (item) =>
                item.city.toLowerCase() === detectedName?.toLowerCase(),
            );
            if (detectedCity) {
              handleSetLocation(detectedCity.city);
            }
            setIsLocating(false);
          } catch (error) {
            console.error("Error fetching city from coordinates:", error);
            await fallbackToIP();
          }
        },
        async () => {
          await fallbackToIP();
        },
        { timeout: 15000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    } catch (err) {
      console.error("Geolocation API exception:", err);
      await fallbackToIP();
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation: handleSetLocation,
        cities,
        isLoadingCities,
        isLocating,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
