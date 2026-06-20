import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePropertyWizardStore } from '@/store/usePropertyWizardStore';
import { useUserAuthStore } from '@/store/userAuthStore';
import { 
  basicInfoSchema, pricingSchema, specificationsSchema, 
  amenitiesSchema, mediaSchema, ownerInfoSchema, 
  availabilitySchema, floorPlansSchema, faqsSchema, localitiesSchema
} from '@/lib/validations/property-wizard.schema';
import { z } from 'zod';
import { toast } from '@/components/ui/toast-store';
import { parseIndianCurrency } from '@/lib/utils/currency.util';
import { ArrowLeft, ArrowRight, Save, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Pricing from './steps/Step2Pricing';
import Step3Location from './steps/Step3Location';
import Step4Localities from './steps/Step4Localities';
import Step5Specifications from './steps/Step4Specifications';
import Step6Amenities from './steps/Step5Amenities';
import Step7Media from './steps/Step6Media';
import Step8OwnerInfo from './steps/Step7OwnerInfo';
import Step9FloorPlans from './steps/Step8FloorPlans';
import Step10Availability from './steps/Step9Availability';
import Step11Faqs from './steps/Step10Faqs';

import type { AdminCity, AdminSublocation } from '@/lib/location-options';

interface PropertyWizardProps {
  isAdmin: boolean;
  availableCities: AdminCity[];
  availableSublocations: AdminSublocation[];
  amenities: any[];
  editPropertyId?: number;
}

const locationSchema = z.object({
  cityId: z.string().min(1, 'City is required'),
  sublocationId: z.string().min(1, 'Sublocation is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('India'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid pincode format'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function PropertyWizard({ isAdmin, availableCities, availableSublocations, amenities, editPropertyId }: PropertyWizardProps) {
  const { currentStep, setStep, formData, updateFormData, clearWizard } = usePropertyWizardStore();
  const userToken = useUserAuthStore(s => s.token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const steps: any[] = [
    { id: 1, title: 'Basic Info', component: Step1BasicInfo, schema: basicInfoSchema },
    { id: 2, title: 'Pricing', component: Step2Pricing, schema: pricingSchema },
    { id: 3, title: 'Location', component: Step3Location, schema: locationSchema },
    { id: 4, title: 'Localities', component: Step4Localities, schema: localitiesSchema },
    { id: 5, title: 'Specs', component: Step5Specifications, schema: specificationsSchema },
    { id: 6, title: 'Amenities', component: Step6Amenities, schema: amenitiesSchema },
    { id: 7, title: 'Media', component: Step7Media, schema: mediaSchema },
    { id: 8, title: 'Owner', component: Step8OwnerInfo, schema: ownerInfoSchema },
    { id: 9, title: 'Floor Plans', component: Step9FloorPlans, schema: floorPlansSchema },
    { id: 10, title: 'Availability', component: Step10Availability, schema: availabilitySchema },
    { id: 11, title: 'FAQs', component: Step11Faqs, schema: faqsSchema },
  ];

  const currentStepConfig = steps.find(s => s.id === currentStep) || steps[0];
  const CurrentStepComponent = currentStepConfig.component;

  const methods = useForm({
    resolver: zodResolver(currentStepConfig.schema),
    defaultValues: formData,
    mode: 'onTouched',
  });

  useEffect(() => {
    methods.reset({ ...formData });
  }, [currentStep]);

  const uploadImagesToR2 = async (images: File[]): Promise<{url: string, key: string}[]> => {
    // Admin token from localStorage; user token from Zustand store (avoids reading the full persisted JSON object)
    const token = isAdmin
      ? window.localStorage.getItem("majestan_access_token")
      : userToken;

    const uploadOne = async (file: File): Promise<{url: string, key: string}> => {
      const presignedRes = await fetch(
        `${API_BASE_URL}/properties/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!presignedRes.ok) throw new Error("Failed to get presigned URL for " + file.name);

      const { data } = await presignedRes.json();
      const { url, key } = data;

      try {
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload " + file.name + " to R2");

        // We use createObjectURL for local immediate preview, while storing the real key for backend.
        return { url: URL.createObjectURL(file), key };
      } catch (err) {
        console.error("Upload error:", err);
        throw new Error("R2 Upload Error: Check your Cloudflare R2 CORS settings. Make sure your bucket allows PUT requests from this origin.");
      }
    };

    return Promise.all(images.map(uploadOne));
  };

  const handleFinalSubmit = async (finalData: any) => {
    setIsSubmitting(true);
    try {
      // Just in case any straggler files made it through (should normally be handled by Step 6 handleNext)
      const uploadedImageKeys = finalData.images?.length > 0 ? await uploadImagesToR2(finalData.images) : [];
      const stragglerKeys = uploadedImageKeys.map(img => img.key);
      
      const existingKeys = (finalData.existingImageUrls || []).map((img: { url: string, key: string }) => img.key);
      const allImageKeys = [...existingKeys, ...stragglerKeys];

      // Derive status: backend expects lowercase enum values from availabilityStatus
      const rawStatus = finalData.availabilityStatus ? finalData.availabilityStatus.toLowerCase() : 'unavailable';

      // Resolve city name/state/country from selected cityId
      const selectedCity = availableCities.find(c => c.id === Number(finalData.cityId));

      const safeNum = (val: any) => {
        if (val === "" || val === null || val === undefined) return null;
        const n = Number(val);
        return isNaN(n) ? null : n;
      };

      const safeCurrency = (val: any) => {
        if (val === "" || val === null || val === undefined) return "";
        const parsed = parseIndianCurrency(val);
        return isNaN(parsed) ? "" : String(parsed);
      };

      const payload = {
        title: finalData.title,
        description: finalData.description,
        propertyType: finalData.propertyType,
        listingType: finalData.listingType,
        slug: finalData.seoSlug || undefined,
        status: rawStatus,
        price: safeCurrency(finalData.price),
        city: selectedCity?.city_name || finalData.city || '',
        state: selectedCity?.state_name || finalData.state || '',
        country: selectedCity?.country_name || finalData.country || 'India',
        cityId: safeNum(finalData.cityId),
        sublocationId: safeNum(finalData.sublocationId),

        propertyCondition: finalData.propertyCondition || undefined,
        ownershipType: finalData.ownershipType || undefined,
        reraNumber: finalData.reraNumber || undefined,
        projectName: finalData.projectName || undefined,
        negotiable: finalData.negotiable || false,
        maintenanceCharges: safeCurrency(finalData.maintenanceCharges),
        securityDeposit: safeCurrency(finalData.securityDeposit),
        bookingAmount: safeCurrency(finalData.bookingAmount),
        brokerageType: finalData.brokerageType || 'no_brokerage',
        brokerageValue: finalData.brokerageValue || undefined,
        availableFrom: finalData.availableFrom || undefined,
        availableUntil: finalData.availableUntil || undefined,
        builderName: finalData.builderName || undefined,
        ownerName: finalData.ownerName || undefined,
        ownerEmail: finalData.ownerEmail || undefined,
        ownerPhone: finalData.ownerPhone || undefined,

        location: {
          address: [finalData.addressLine1, finalData.addressLine2].filter(Boolean).join(', '),
          pincode: finalData.pincode,
          latitude: safeNum(finalData.latitude),
          longitude: safeNum(finalData.longitude),
          localityData: finalData.localityData || undefined,
        },
        details: {
          bedrooms: safeNum(finalData.bedrooms),
          bathrooms: safeNum(finalData.bathrooms),
          areaSqft: safeNum(finalData.builtUpArea),
          furnished: finalData.furnishing === 'Furnished' || finalData.furnishing === 'Semi Furnished',
          facing: finalData.propertyFacing,
          buildUpArea: safeNum(finalData.builtUpArea),
          carpetArea: safeNum(finalData.carpetArea),
          totalFloors: safeNum(finalData.totalFloors),
          balconies: safeNum(finalData.balconies),
          floorNumber: finalData.floorNumber || undefined,
          superBuiltUpArea: safeNum(finalData.superBuiltUpArea),
          plotArea: safeNum(finalData.plotArea),
          areaUnit: finalData.areaUnit || undefined,
          propertyAge: finalData.propertyAge || undefined,
          possessionStatus: finalData.possessionStatus || undefined,
          waterSupply: finalData.waterSupply || undefined,
          powerBackup: finalData.powerBackup ?? undefined,
          roadWidth: finalData.roadWidth || undefined,
          openSides: safeNum(finalData.openSides),
          plotLength: safeNum(finalData.plotLength),
          plotWidth: safeNum(finalData.plotWidth),
          boundaryWall: finalData.boundaryWall,
          suitableFor: finalData.suitableFor || undefined,
          hasPantry: finalData.hasPantry,
          hasCentralAc: finalData.hasCentralAc,
          ceilingHeightFt: safeNum(finalData.ceilingHeightFt),
          heavyVehicleAccess: finalData.heavyVehicleAccess,
          // Plot
          plotSizeCents: safeNum(finalData.plotSizeCents),
          // Coworking
          minSeats: safeNum(finalData.minSeats),
          rentPerSeat: safeNum(finalData.rentPerSeat),
          privateCabins: safeNum(finalData.privateCabins),
          meetingRooms: safeNum(finalData.meetingRooms),
          availableWorkstations: safeNum(finalData.availableWorkstations),
          hasRestroom: finalData.hasRestroom,
          // Commercial
          floorsOccupied: finalData.floorsOccupied || [],
          // Industrial
          truckParking: safeNum(finalData.truckParking),
          carParking: safeNum(finalData.carParking),
          bikeParking: safeNum(finalData.bikeParking),
          coveredArea: safeNum(finalData.coveredArea),
          openArea: safeNum(finalData.openArea),
          floorType: finalData.floorType || undefined,
          powerSupplyHp: safeNum(finalData.powerSupplyHp),
          // Apartment
          guestParking: finalData.guestParking,
        },
        amenities: (finalData.amenityIds || []).map((id: number) => ({ amenityId: id })),
        files: allImageKeys.map((key) => ({ fileType: "IMAGE", fileUrl: key, fileKey: key })),
        units: finalData.units || [],
        faqs: (finalData.faqs || []).filter((f: any) => f.question && f.answer),
      };
      
      console.log('Sending Property Payload:', payload);

      const token = isAdmin
        ? window.localStorage.getItem("majestan_access_token")
        : userToken;
      
      let endpoint = '';
      let method = '';
      
      if (editPropertyId) {
        endpoint = `${API_BASE_URL}/admin/properties/${finalData.propertyType}/${editPropertyId}`;
        method = 'PATCH';
      } else {
        endpoint = isAdmin ? `${API_BASE_URL}/admin/properties/${finalData.propertyType}` : `${API_BASE_URL}/properties/submit/${finalData.propertyType}`;
        method = 'POST';
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend validation error:", errorData);
        throw new Error(`Failed to save property: ${JSON.stringify(errorData.message || errorData)}`);
      }
      
      clearWizard();
      toast.success(`Property ${editPropertyId ? 'updated' : 'created'} successfully!`);
      router.push(isAdmin ? "/admin/properties" : "/");
      
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processCurrentStep = async (): Promise<boolean> => {
    const isValid = await methods.trigger();
    if (!isValid) {
      console.log("Validation Errors:", methods.formState.errors);
      const errors = methods.formState.errors;
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const errorMsg = (errors as any)[firstErrorKey]?.message;
        toast.error(`Please fix the errors before continuing. ${firstErrorKey}: ${errorMsg}`);
      }
      return false;
    }
    
    let rawValues = methods.getValues();
    let currentValues: any = Object.fromEntries(Object.entries(rawValues).filter(([_, v]) => v !== undefined && v !== null));
    console.log("Validation passed", currentValues);

    // Immediately upload images after Step 7 to avoid losing File objects in localStorage
    if (currentStep === 7) {
      const filesToUpload = currentValues.images?.filter((f: any) => f instanceof File || f instanceof Blob) || [];
      if (filesToUpload.length > 0) {
        setIsSubmitting(true);
        try {
          const uploadedImages = await uploadImagesToR2(filesToUpload);
          const existing = currentValues.existingImageUrls || [];
          const newExisting = [...existing, ...uploadedImages];
          methods.setValue('existingImageUrls', newExisting);
          methods.setValue('images', []);
          currentValues = Object.fromEntries(Object.entries(methods.getValues()).filter(([_, v]) => v !== undefined && v !== null));
        } catch (err) {
          console.error(err);
          toast.error(err instanceof Error ? err.message : "Failed to upload images.");
          setIsSubmitting(false);
          return false;
        } finally {
          setIsSubmitting(false);
        }
      }
    }

    updateFormData(currentValues);
    return true;
  };

  const handleNext = async () => {
    const success = await processCurrentStep();
    if (success) {
      if (currentStep < steps.length) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(currentStep + 1);
      } else {
        await handleFinalSubmit({ ...formData, ...methods.getValues() });
      }
    }
  };

  const handleStepJump = async (targetStepId: number) => {
    if (!editPropertyId || targetStepId === currentStep) return;
    const success = await processCurrentStep();
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(targetStepId);
    }
  };

  const handleQuickSave = async () => {
    const success = await processCurrentStep();
    if (success) {
      await handleFinalSubmit({ ...formData, ...methods.getValues() });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const rawValues = methods.getValues();
      const currentValues: any = Object.fromEntries(
        Object.entries(rawValues).filter(([_, v]) => v !== undefined && v !== null)
      );
      updateFormData(currentValues);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="!w-full !max-w-full !mx-auto !font-sans !tracking-tight">
      
      {/* Modern Stepper Header */}
      <div className="!mb-6">
        <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !p-6 !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !relative !overflow-hidden">
          {/* Progress Bar Background */}
          <div className="!absolute !bottom-0 !left-0 !w-full !h-1 !bg-gray-50 dark:!bg-[#0f1015]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="!h-full !bg-blue-600 !rounded-r-full"
            />
          </div>

          <div className="!flex !items-center !justify-between !gap-4 !overflow-x-auto [&::-webkit-scrollbar]:!hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] !pt-2 !pb-4">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div 
                  key={step.id} 
                  onClick={() => {
                    if (editPropertyId) handleStepJump(step.id);
                  }}
                  className={`!flex !flex-col !items-center !min-w-[70px] !gap-2 !transition-all !duration-300 ${isActive ? '!opacity-100 !scale-105' : isCompleted ? '!opacity-100' : '!opacity-40 grayscale'} ${editPropertyId && !isActive ? '!cursor-pointer hover:!scale-105 hover:!opacity-100' : ''}`}
                >
                  <div className={`!w-9 !h-9 !rounded-full !flex !items-center !justify-center !text-sm !font-semibold !transition-all !duration-500 ${
                    isActive ? '!bg-gray-900 dark:!bg-blue-600 !text-white !shadow-md !ring-4 !ring-gray-900/10 dark:!ring-blue-500/20' :
                    isCompleted ? '!bg-gray-900 dark:!bg-blue-600 !text-white' : '!bg-gray-50 dark:!bg-[#0f1015] !text-gray-400 dark:!text-gray-500 !border !border-gray-200 dark:!border-[#262730]'
                  }`}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                  </div>
                  <span className={`!text-[12px] !font-medium ${isActive ? '!text-gray-900 dark:!text-white' : '!text-gray-500 dark:!text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Container - Mimicking Dashboard Widget */}
      <div className="!bg-white dark:!bg-[#171821] !rounded-2xl !border !border-gray-100 dark:!border-[#262730] !shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:!shadow-none !overflow-hidden">
        
        {/* Header Strip */}
        <div className="!px-8 !py-6 !border-b !border-gray-50 dark:!border-[#262730] !bg-gray-50/30 dark:!bg-[#0f1015]/50">
          <h2 className="!text-xl !font-bold !text-gray-900 dark:!text-white">{currentStepConfig.title}</h2>
          <p className="!text-sm !text-gray-500 dark:!text-gray-400 !mt-1">Please provide the details below to continue.</p>
        </div>

        <div className="!p-8">
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrentStepComponent 
                    isAdmin={isAdmin}
                    availableCities={availableCities} 
                    availableSublocations={availableSublocations}
                    amenities={amenities}
                  />
                </motion.div>
              </AnimatePresence>
            </form>
          </FormProvider>
        </div>

        {/* Action Bar */}
        <div className="!px-8 !py-5 !bg-gray-50/50 dark:!bg-[#0f1015] !border-t !border-gray-100 dark:!border-[#262730] !flex !items-center !justify-between">
          <button 
            type="button" 
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="!inline-flex !items-center !gap-2 !px-6 !py-2.5 !rounded-xl !text-sm !font-medium !text-gray-700 dark:!text-gray-300 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] hover:!border-gray-300 dark:hover:!border-gray-600 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] !shadow-sm !transition-all active:!scale-[0.98] disabled:!opacity-40 disabled:!cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="!flex !items-center !gap-3">
            {editPropertyId && currentStep !== steps.length && (
              <button 
                type="button"
                onClick={handleQuickSave}
                disabled={isSubmitting}
                className="!inline-flex !items-center !gap-2 !px-6 !py-2.5 !rounded-xl !text-sm !font-medium !text-blue-700 dark:!text-blue-400 !bg-blue-50 dark:!bg-blue-500/10 hover:!bg-blue-100 dark:hover:!bg-blue-500/20 !border !border-blue-200 dark:!border-blue-500/30 !transition-all active:!scale-[0.98] disabled:!opacity-70 disabled:!cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={16} className="!animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            )}

            <button 
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="!inline-flex !items-center !gap-2 !px-8 !py-2.5 !rounded-xl !text-sm !font-medium !text-white !bg-gray-900 hover:!bg-black dark:!bg-blue-600 dark:hover:!bg-blue-700 !shadow-md hover:!shadow-lg !transition-all active:!scale-[0.98] disabled:!opacity-70 disabled:!cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="!animate-spin" /> : currentStep === steps.length ? <Save size={16} /> : null}
              {isSubmitting ? 'Processing...' : currentStep === steps.length ? (editPropertyId ? 'Update Property' : 'Submit Property') : 'Continue'}
              {!isSubmitting && currentStep !== steps.length && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
