"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import PropertyWizard from "@/components/admin/property-wizard/PropertyWizard";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { AdminCity, AdminSublocation } from "@/lib/location-options";

export default function NewPropertyPage() {
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<AdminCity[]>([]);
  const [availableSublocations, setAvailableSublocations] = useState<AdminSublocation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("majestan_access_token");
        const [amenitiesRes, citiesRes, sublocationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/amenities`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/admin/cities/all`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/admin/sublocations/all`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (amenitiesRes.ok) {
          const json = await amenitiesRes.json();
          setAmenities(json.data?.items || json.items || json.data || json || []);
        }

        if (citiesRes.ok) {
          const json = await citiesRes.json();
          setAvailableCities((json.data || json || []) as AdminCity[]);
        }

        if (sublocationsRes.ok) {
          const json = await sublocationsRes.json();
          setAvailableSublocations((json.data || json || []) as AdminSublocation[]);
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
    <div className="!w-full !space-y-6">
      <div className="!flex !items-center !gap-4">
        <Link href="/admin/properties" className="!p-2 !text-gray-500 dark:!text-gray-400 hover:!bg-white dark:!bg-[#171821] !rounded-xl !transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="!text-2xl !font-medium !text-gray-800 dark:!text-white !tracking-tight">Add New Property</h2>
      </div>

      {loading ? (
        <div className="!flex !items-center !justify-center !p-20">
          <Loader2 size={32} className="!animate-spin !text-blue-600" />
        </div>
      ) : (
        <PropertyWizard 
          isAdmin={true} 
          availableCities={availableCities} 
          availableSublocations={availableSublocations}
          amenities={amenities}
        />
      )}
    </div>
  );
}
