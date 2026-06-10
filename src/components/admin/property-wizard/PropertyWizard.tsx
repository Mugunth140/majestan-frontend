import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePropertyWizardStore } from '@/store/usePropertyWizardStore';
import { basicInfoSchema, pricingSchema, specificationsSchema, amenitiesSchema, mediaSchema } from '@/lib/validations/property-wizard.schema';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Save, Loader2, Check } from 'lucide-react';

import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Pricing from './steps/Step2Pricing';
import Step3Location from './steps/Step3Location';
import Step4Specifications from './steps/Step4Specifications';
import Step5Amenities from './steps/Step5Amenities';
import Step6Media from './steps/Step6Media';

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

const steps = [
  { id: 1, title: 'Basic Info', component: Step1BasicInfo, schema: basicInfoSchema },
  { id: 2, title: 'Pricing', component: Step2Pricing, schema: pricingSchema },
  { id: 3, title: 'Location', component: Step3Location, schema: locationSchema },
  { id: 4, title: 'Specs', component: Step4Specifications, schema: specificationsSchema },
  { id: 5, title: 'Amenities', component: Step5Amenities, schema: amenitiesSchema },
  { id: 6, title: 'Media', component: Step6Media, schema: mediaSchema },
  // We will add the rest of the steps here later
];

export default function PropertyWizard({ isAdmin, availableCities, availableSublocations, amenities }: PropertyWizardProps) {
  const { currentStep, setStep, formData, updateFormData } = usePropertyWizardStore();

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

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      updateFormData(methods.getValues());
      if (currentStep < steps.length) {
        setStep(currentStep + 1);
      } else {
        // Final Submit Logic Placeholder
        console.log("Final form data to submit:", methods.getValues());
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
    <div className="w-full! max-w-6xl! mx-auto! space-y-8!">
      
      {/* Stepper Header */}
      <div className="bg-white/40! backdrop-blur-xl! border! border-white/60! rounded-3xl! p-6! shadow-[0_8px_30px_rgb(0,0,0,0.04)]!">
        <div className="flex! items-center! justify-between! gap-4! overflow-x-auto! pb-2! scrollbar-hide!">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex! items-center! gap-3! min-w-max!">
              <div className={`w-10! h-10! rounded-2xl! flex! items-center! justify-center! text-[14px]! font-bold! transition-all! duration-300! ${
                currentStep === step.id 
                  ? 'bg-blue-600! text-white! shadow-lg! shadow-blue-500/30!' 
                  : currentStep > step.id 
                    ? 'bg-emerald-500! text-white!' 
                    : 'bg-white! text-gray-400! border! border-gray-200!'
              }`}>
                {currentStep > step.id ? <Check size={18} /> : step.id}
              </div>
              <span className={`text-[13px]! font-semibold! ${
                currentStep === step.id ? 'text-gray-900!' : 'text-gray-500!'
              }`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-6! md:w-10! h-px! mx-1! md:mx-2! ${currentStep > step.id ? 'bg-emerald-500!' : 'bg-gray-200!'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="bg-white/40! backdrop-blur-xl! border! border-white/60! rounded-3xl! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! overflow-hidden!">
        <div className="p-8! md:p-10!">
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              <CurrentStepComponent 
                availableCities={availableCities} 
                availableSublocations={availableSublocations}
                amenities={amenities}
              />
            </form>
          </FormProvider>
        </div>

        {/* Navigation Footer */}
        <div className="px-8! py-6! bg-white/50! border-t! border-white/60! flex! items-center! justify-between!">
          <button 
            type="button" 
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex! items-center! gap-2! px-6! py-3! rounded-xl! text-[14px]! font-semibold! text-gray-700! bg-white! border! border-gray-200! hover:bg-gray-50! transition-all! disabled:opacity-40! disabled:cursor-not-allowed!"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <button 
            type="button"
            onClick={handleNext}
            className="inline-flex! items-center! gap-2! px-8! py-3! rounded-xl! text-[14px]! font-semibold! text-white! bg-blue-600! hover:bg-blue-700! shadow-lg! shadow-blue-500/25! hover:shadow-blue-500/40! transition-all!"
          >
            {currentStep === steps.length ? 'Review & Submit' : 'Next Step'}
            {currentStep !== steps.length && <ArrowRight size={18} />}
          </button>
        </div>
      </div>

    </div>
  );
}
