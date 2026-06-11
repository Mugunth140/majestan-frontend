"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { ModernLoader } from "@/components/admin/ui/ModernLoader";
import Link from "next/link";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import PropertyWizard from "@/components/admin/property-wizard/PropertyWizard";

export default function PostPropertyPage() {
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  const [availableSublocations, setAvailableSublocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/properties/form-data`);
        if (res.ok) {
          const jsonRaw = await res.json();
          const json = jsonRaw.data || jsonRaw;
          setAmenities(json.amenities || []);
          
          const citiesData = json.cities || [];
          setAvailableCities(citiesData.map((c: any) => ({
            id: c.id,
            city_name: c.city_name,
            state_name: c.state_name,
            country_name: c.country_name || "India"
          })));

          const subData = json.sublocations || [];
          setAvailableSublocations(subData.map((s: any) => ({
            id: s.id,
            city_id: s.city_id,
            locality_name: s.locality_name,
            postal_code: s.postal_code
          })));
        }
      } catch (err) {
        console.error("Failed to fetch form data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <SiteHeader />
      <div className="!pt-[120px] !pb-20 !bg-[#f8f9fa] !min-h-screen">
        <div className="!w-full !max-w-full !mx-auto !space-y-6 !px-4 md:!px-0">
          <div className="!flex !items-center !gap-4">
            <Link href="/" className="!p-2 !text-gray-500 hover:!bg-white !rounded-xl !transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="!text-2xl !font-bold !text-gray-900 !tracking-tight">Post Your Property</h2>
          </div>

      {loading ? (
        <ModernLoader text="Initializing Setup..." />
      ) : (
        <PropertyWizard 
              isAdmin={false} 
              availableCities={availableCities} 
              availableSublocations={availableSublocations}
              amenities={amenities}
            />
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
