"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { usePropertyWizardStore } from "@/store/usePropertyWizardStore";
import PropertyWizard from "@/components/admin/property-wizard/PropertyWizard";
import { ModernLoader } from "@/components/admin/ui/ModernLoader";
import type { AdminCity, AdminSublocation } from "@/lib/location-options";
import { formatToShortIndianCurrency } from "@/lib/utils/currency.util";

export default function EditPropertyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const propertyType = searchParams.get("type") || "apartment";

  const { clearWizard, updateFormData, setStep } = usePropertyWizardStore();

  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<AdminCity[]>([]);
  const [localities, setLocalities] = useState<AdminSublocation[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      const token = window.localStorage.getItem("majestan_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [amenitiesRes, citiesRes, subsRes, propRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/amenities`, { headers }),
          fetch(`${API_BASE_URL}/admin/cities/all`, { headers }),
          fetch(`${API_BASE_URL}/admin/sublocations/all`, { headers }),
          fetch(`${API_BASE_URL}/admin/properties/${propertyType}/${id}`, { headers }),
        ]);

        if (!isMounted) return;

        let fetchedAmenities: any[] = [];
        let fetchedCities: AdminCity[] = [];
        let fetchedSublocations: AdminSublocation[] = [];
        let p: any = null;

        if (amenitiesRes.ok) {
          const j = await amenitiesRes.json();
          fetchedAmenities = j.data?.items || j.items || j.data || j || [];
        }
        if (citiesRes.ok) {
          const j = await citiesRes.json();
          fetchedCities = (j.data || j || []) as AdminCity[];
        }
        if (subsRes.ok) {
          const j = await subsRes.json();
          fetchedSublocations = (j.data || j || []) as AdminSublocation[];
        }
        if (propRes.ok) {
          const j = await propRes.json();
          p = j.data || j;
        }

        if (p) {
          setAvailableCities(fetchedCities);
          setLocalities(fetchedSublocations);
          setAmenities(fetchedAmenities);

          const det = p.propertyDetails || {};
          const locs = p.propertyLocations || [];
          const loc = locs[0] || {};
          const subloc = loc.sublocation || {};

          clearWizard();
          
          updateFormData({
            title: p.title || "",
            description: p.description || "",
            propertyType: p.propertyType || propertyType,
            listingType: p.listingType ? (p.listingType.charAt(0).toUpperCase() + p.listingType.slice(1).toLowerCase()) : "Sell",
            status: p.status ? p.status.toUpperCase() : "AVAILABLE",
            builderName: p.builderName || "",
            propertyCondition: p.propertyCondition || undefined,
            ownershipType: p.ownershipType || undefined,
            reraNumber: p.reraNumber || "",
            projectName: p.projectName || "",

            price: p.price ? formatToShortIndianCurrency(p.price) : "",
            negotiable: p.negotiable || false,
            maintenanceCharges: p.maintenanceCharges ? formatToShortIndianCurrency(p.maintenanceCharges) : "",
            securityDeposit: p.securityDeposit ? formatToShortIndianCurrency(p.securityDeposit) : "",
            bookingAmount: p.bookingAmount ? formatToShortIndianCurrency(p.bookingAmount) : "",
            brokerageType: p.brokerageType || "no_brokerage",
            brokerageValue: p.brokerageValue || "",

            cityId: subloc.cityId ? String(subloc.cityId) : "",
            sublocationId: loc.locationId ? String(loc.locationId) : "",
            state: p.state || "",
            country: p.country || "India",
            addressLine1: loc.address || "",
            addressLine2: loc.landmark || "",
            pincode: loc.pincode || "",

            bedrooms: det.bedrooms != null ? String(det.bedrooms) : "",
            bathrooms: det.bathrooms != null ? String(det.bathrooms) : "",
            builtUpArea: det.builtUpArea != null ? String(det.builtUpArea) : det.areaSqft != null ? String(det.areaSqft) : "",
            carpetArea: det.carpetArea != null ? String(det.carpetArea) : "",
            totalFloors: det.totalFloors != null ? String(det.totalFloors) : "",
            propertyFacing: det.propertyFacing || undefined,
            furnishing: det.furnished ? "Furnished" : "Unfurnished",
            parkingSpaces: det.parking != null ? String(det.parking) : "",
            balconies: det.balconies != null ? String(det.balconies) : "",
            floorNumber: det.floorNumber || "",
            superBuiltUpArea: det.superBuiltUpArea != null ? String(det.superBuiltUpArea) : "",
            plotArea: det.plotArea != null ? String(det.plotArea) : "",
            areaUnit: det.areaUnit || "Sq Ft",
            propertyAge: det.propertyAge || undefined,
            possessionStatus: det.possessionStatus || undefined,
            waterSupply: det.waterSupply || "",
                            powerBackup: det.powerBackup ?? false,
            roadWidth: det.roadWidth || "",
            openSides: det.openSides != null ? String(det.openSides) : "",
            plotLength: det.plotLength != null ? String(det.plotLength) : "",
            plotWidth: det.plotWidth != null ? String(det.plotWidth) : "",
            boundaryWall: det.boundaryWall ?? false,
            suitableFor: det.suitableFor || "",
            hasPantry: det.hasPantry ?? false,
            hasCentralAc: det.hasCentralAc ?? false,
            ceilingHeightFt: det.ceilingHeightFt != null ? String(det.ceilingHeightFt) : "",
            heavyVehicleAccess: det.heavyVehicleAccess ?? false,

            // Plot
            plotSizeCents: det.plotSizeCents != null ? String(det.plotSizeCents) : "",

            // Coworking
            minSeats: det.minSeats != null ? String(det.minSeats) : "",
            rentPerSeat: det.rentPerSeat != null ? String(det.rentPerSeat) : "",
            privateCabins: det.privateCabins != null ? String(det.privateCabins) : "",
            meetingRooms: det.meetingRooms != null ? String(det.meetingRooms) : "",
            availableWorkstations: det.availableWorkstations != null ? String(det.availableWorkstations) : "",
            hasRestroom: det.hasRestroom ?? false,

            // Commercial
            floorsOccupied: Array.isArray(det.floorsOccupied) ? det.floorsOccupied : [],

            // Industrial
            truckParking: det.truckParking != null ? String(det.truckParking) : "",
            carParking: det.carParking != null ? String(det.carParking) : "",
            bikeParking: det.bikeParking != null ? String(det.bikeParking) : "",
            coveredArea: det.coveredArea != null ? String(det.coveredArea) : "",
            openArea: det.openArea != null ? String(det.openArea) : "",
            floorType: det.floorType || "",
            powerSupplyHp: det.powerSupplyHp != null ? String(det.powerSupplyHp) : "",

            // Apartment
            guestParking: det.guestParking ?? false,

            amenityIds: (p.propertyAmenities || []).map((a: any) => a.amenityId),

            units: (p.propertyUnits || []).map((u: any) => ({
              unitType: u.unitType || '',
              title: u.title || '',
              price: u.price || '',
              sizeSqft: u.builtupAreaSqft ? Number(u.builtupAreaSqft) : (u.carpetAreaSqft ? Number(u.carpetAreaSqft) : 0),
              floorPlanImageUrl: u.floorPlanImageUrl || '',
              floorPlanImageKey: u.floorPlanImageKey || '',
            })),

            existingImageUrls: (p.propertyImages || []).map((img: any) => ({
              url: img.imageUrl,
              key: img.imageKey
            })),
            images: [], // New images start empty

            ownerName: p.ownerName || (p.owner?.firstName ? `${p.owner.firstName} ${p.owner.lastName || ''}` : ""),
            ownerEmail: p.ownerEmail || p.owner?.email || "",
            ownerPhone: p.ownerPhone || p.owner?.mobileNumber || "",

            availableFrom: p.availableFrom ? new Date(p.availableFrom).toISOString().split('T')[0] : "",
            availableUntil: p.availableUntil ? new Date(p.availableUntil).toISOString().split('T')[0] : "",
            availabilityStatus: "Available",
            publishImmediately: p.status === 'AVAILABLE' || p.status === 'available',
            seoSlug: p.slug || "",

            faqs: (p.propertyFaqs || p.faqs || []).map((f: any) => ({
              question: f.question || '',
              answer: f.answer || '',
              section: f.section || 'overview',
            })),
          });

          setStep(1);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load property for edit:", err);
        setLoading(false);
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, [id, propertyType]);

  // Clean up wizard when leaving the page entirely
  useEffect(() => {
    return () => clearWizard();
  }, []);

  if (loading) {
    return <ModernLoader text="Loading Property Details..." />;
  }

  return (
    <div className="!max-w-4xl !mx-auto !w-full !pb-20">
      <h1 className="!text-2xl !font-bold !text-gray-900 dark:!text-white !mb-6 !flex !items-center !gap-3">
        Edit Property
      </h1>
      
      <PropertyWizard 
        isAdmin={true} 
        availableCities={availableCities} 
        availableSublocations={localities} 
        amenities={amenities} 
        editPropertyId={Number(id)}
      />
    </div>
  );
}
