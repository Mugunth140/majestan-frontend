import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePropertyWizardStore } from '@/store/usePropertyWizardStore';
import { 
 basicInfoSchema, pricingSchema, specificationsSchema, 
 amenitiesSchema, mediaSchema, ownerInfoSchema, 
 seoSchema, availabilitySchema, verificationSchema 
} from '@/lib/validations/property-wizard.schema';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Save, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Pricing from './steps/Step2Pricing';
import Step3Location from './steps/Step3Location';
import Step4Specifications from './steps/Step4Specifications';
import Step5Amenities from './steps/Step5Amenities';
import Step6Media from './steps/Step6Media';
import Step7OwnerInfo from './steps/Step7OwnerInfo';
import Step8SEO from './steps/Step8SEO';
import Step9Availability from './steps/Step9Availability';
import Step10Verification from './steps/Step10Verification';

import type { AdminCity, AdminSublocation } from '@/lib/location-options';

interface PropertyWizardProps {
 isAdmin: boolean;
 availableCities: AdminCity[];
 availableSublocations: AdminSublocation[];
 amenities: any[];
}

const locationSchema = z.object({
 cityId: z.string().min(1, 'City is required'),
 sublocationId: z.string().min(1, 'Sublocation is required'),
 state: z.string().min(1, 'State is required'),
 country: z.string().default('India'),
 addressLine1: z.string().min(5, 'Address is required'),
 addressLine2: z.string().optional(),
 pincode: z.string().min(6, 'Valid pincode required'),
});

export default function PropertyWizard({ isAdmin, availableCities, availableSublocations, amenities }: PropertyWizardProps) {
 const { currentStep, setStep, formData, updateFormData, clearWizard } = usePropertyWizardStore();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const router = useRouter();

 // Conditionally build steps
 const steps = [
 { id: 1, title: 'Basic Info', component: Step1BasicInfo, schema: basicInfoSchema },
 { id: 2, title: 'Pricing', component: Step2Pricing, schema: pricingSchema },
 { id: 3, title: 'Location', component: Step3Location, schema: locationSchema },
 { id: 4, title: 'Specs', component: Step4Specifications, schema: specificationsSchema },
 { id: 5, title: 'Amenities', component: Step5Amenities, schema: amenitiesSchema },
 { id: 6, title: 'Media', component: Step6Media, schema: mediaSchema },
 { id: 7, title: 'Owner', component: Step7OwnerInfo, schema: ownerInfoSchema },
 ];

 if (isAdmin) {
 steps.push({ id: 8, title: 'SEO', component: Step8SEO, schema: seoSchema });
 }

 steps.push({ id: isAdmin ? 9 : 8, title: 'Availability', component: Step9Availability, schema: availabilitySchema });

 if (isAdmin) {
 steps.push({ id: 10, title: 'Publish', component: Step10Verification, schema: verificationSchema });
 }

 const currentStepConfig = steps.find(s => s.id === currentStep) || steps[0];
 const CurrentStepComponent = currentStepConfig.component;

 const methods = useForm({
 resolver: zodResolver(currentStepConfig.schema),
 defaultValues: formData,
 mode: 'onTouched',
 });

 useEffect(() => {
 methods.reset({ ...formData, ...methods.getValues() });
 }, [currentStep, formData, methods]);

 const uploadImagesToR2 = async (images: File[]): Promise<string[]> => {
 const uploadedUrls: string[] = [];
 const token = window.localStorage.getItem("majestan_access_token") || window.localStorage.getItem("majestan_user_auth");

 for (const file of images) {
 const presignedRes = await fetch(
 `${API_BASE_URL}/properties/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`,
 { headers: token ? { Authorization: `Bearer ${token}` } : {} }
 );
 if (!presignedRes.ok) throw new Error("Failed to get presigned URL for " + file.name);

 const { data } = await presignedRes.json();
 const { url, key } = data;

 const uploadRes = await fetch(url, {
 method: "PUT",
 headers: { "Content-Type": file.type },
 body: file,
 });
 if (!uploadRes.ok) throw new Error("Failed to upload " + file.name + " to R2");
 uploadedUrls.push(key);
 }
 return uploadedUrls;
 };

 const handleFinalSubmit = async (finalData: any) => {
 setIsSubmitting(true);
 try {
 const uploadedImageKeys = finalData.images?.length > 0 ? await uploadImagesToR2(finalData.images) : [];
 
 const payload = {
 title: finalData.title,
 description: finalData.description,
 propertyType: finalData.propertyType,
 listingType: finalData.listingType,
 status: isAdmin && finalData.publishImmediately ? 'AVAILABLE' : (finalData.status || 'UNAVAILABLE'),
 price: finalData.price,
 city: finalData.city,
 state: finalData.state,
 country: finalData.country,
 cityId: Number(finalData.cityId),
 sublocationId: Number(finalData.sublocationId),
 location: {
 addressLine1: finalData.addressLine1,
 addressLine2: finalData.addressLine2,
 pincode: finalData.pincode
 },
 details: {
 bedrooms: Number(finalData.bedrooms) || 0,
 bathrooms: Number(finalData.bathrooms) || 0,
 areaSqft: Number(finalData.builtUpArea) || 0,
 furnishing: finalData.furnishing,
 propertyAge: finalData.propertyAge,
 propertyFacing: finalData.propertyFacing
 },
 amenities: (finalData.amenityIds || []).map((id: number) => ({ amenityId: id })),
 files: uploadedImageKeys.map((key) => ({ fileType: "IMAGE", fileUrl: key })),
 seo: isAdmin ? {
 slug: finalData.seoSlug,
 metaTitle: finalData.metaTitle,
 metaDescription: finalData.metaDescription,
 metaKeywords: finalData.metaKeywords
 } : undefined
 };

 const token = window.localStorage.getItem(isAdmin ? "majestan_access_token" : "majestan_user_auth");
 const endpoint = isAdmin ? `${API_BASE_URL}/admin/properties/${finalData.propertyType}` : `${API_BASE_URL}/properties/submit/${finalData.propertyType}`;

 const res = await fetch(endpoint, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(token && { "Authorization": `Bearer ${token}` })
 },
 body: JSON.stringify(payload)
 });

 if (!res.ok) throw new Error("Failed to create property");
 
 clearWizard();
 router.push(isAdmin ? "/admin/properties" : "/");
 
 } catch (error) {
 console.error(error);
 alert("Submission failed. Please check the console for details.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleNext = async () => {
 const isValid = await methods.trigger();
 if (isValid) {
 const currentValues = methods.getValues();
 updateFormData(currentValues);
 
 if (currentStep < steps.length) {
 setStep(currentStep + 1);
 } else {
 await handleFinalSubmit({ ...formData, ...currentValues });
 }
 }
 };

 const handleBack = () => {
 if (currentStep > 1) {
 updateFormData(methods.getValues());
 setStep(currentStep - 1);
 }
 };

 return (
 <div className="!w-full !max-w-6xl !mx-auto !space-y-8">
 {/* Stepper Header */}
 <div className="!bg-white !border !border-gray-100 !rounded-3xl !p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)!]">
 <div className="!flex !items-center !justify-between !gap-4 !overflow-x-auto !pb-2 !scrollbar-hide">
 {steps.map((step, idx) => (
 <div key={step.id} className="!flex !items-center !gap-3 !min-w-max">
 <div className={`!w-10 !h-10 !rounded-2xl !flex !items-center !justify-center !text-[14px] !font-bold !transition-all !duration-300 ${
 currentStep === step.id 
 ? '!bg-blue-600 !text-white !shadow-lg !shadow-blue-500/30' 
 : currentStep > step.id 
 ? '!bg-emerald-500 !text-white' 
 : '!bg-white !text-gray-400 !border !border-gray-200'
 }`}>
 {currentStep > step.id ? <Check size={18} /> : step.id}
 </div>
 <span className={`!text-[13px] !font-semibold ${currentStep === step.id ? '!text-gray-900' : '!text-gray-500'}`}>
 {step.title}
 </span>
 {idx < steps.length - 1 && (
 <div className={`!w-4 md:!w-8 !h-px !mx-1 md:!mx-2 ${currentStep > step.id ? '!bg-emerald-500' : '!bg-gray-200'}`} />
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Main Form Area */}
 <div className="!bg-white !border !border-gray-100 !rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)!] !overflow-hidden">
 <div className="!p-8 md:!p-10">
 <FormProvider {...methods}>
 <form onSubmit={(e) => e.preventDefault()}>
 <CurrentStepComponent 
 isAdmin={isAdmin}
 availableCities={availableCities} 
 availableSublocations={availableSublocations}
 amenities={amenities}
 />
 </form>
 </FormProvider>
 </div>

 {/* Navigation Footer */}
 <div className="!px-8 !py-6 !bg-white/50 !border-t !border-gray-200 !flex !items-center !justify-between">
 <button 
 type="button" 
 onClick={handleBack}
 disabled={currentStep === 1 || isSubmitting}
 className="!inline-flex !items-center !gap-2 !px-6 !py-3 !rounded-xl !text-[14px] !font-semibold !text-gray-700 !bg-white !border !border-gray-200 hover:!bg-gray-50 !transition-all disabled:!opacity-40 disabled:!cursor-not-allowed"
 >
 <ArrowLeft size={18} /> Back
 </button>
 
 <button 
 type="button"
 onClick={handleNext}
 disabled={isSubmitting}
 className="!inline-flex !items-center !gap-2 !px-8 !py-3 !rounded-xl !text-[14px] !font-semibold !text-white !bg-blue-600 hover:!bg-blue-700 !shadow-lg !shadow-blue-500/25 hover:!shadow-blue-500/40 !transition-all disabled:!opacity-70"
 >
 {isSubmitting ? <Loader2 size={18} className="!animate-spin" /> : currentStep === steps.length ? <Save size={18} /> : null}
 {isSubmitting ? 'Processing...' : currentStep === steps.length ? 'Submit Property' : 'Next Step'}
 {!isSubmitting && currentStep !== steps.length && <ArrowRight size={18} />}
 </button>
 </div>
 </div>
 </div>
 );
}
