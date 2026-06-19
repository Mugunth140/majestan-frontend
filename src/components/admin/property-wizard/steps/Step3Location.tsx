import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';
import type { AdminCity, AdminSublocation } from '@/lib/location-options';

interface Step3LocationProps {
  availableCities: AdminCity[];
  availableSublocations: AdminSublocation[];
}

export default function Step3Location({ availableCities, availableSublocations }: Step3LocationProps) {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const cityId = watch('cityId');
  const isFirstMount = useRef(true);

  const filteredSublocations = React.useMemo(() => {
    if (!cityId) return [];
    return availableSublocations.filter(sub => sub.city_id === Number(cityId));
  }, [cityId, availableSublocations]);

  useEffect(() => {
    if (cityId) {
      const cityData = availableCities.find((c) => c.id === Number(cityId));
      if (cityData) {
        setValue('state', cityData.state_name);
        setValue('country', cityData.country_name || 'India');
        setValue('city', cityData.city_name);
      }
      // Reset sublocationId when city changes (skip on first mount in edit mode)
      if (!isFirstMount.current) {
        setValue('sublocationId', '');
      }
    }
    isFirstMount.current = false;
  }, [cityId, availableCities, setValue]);

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        
        <FloatingSelect 
          id="cityId"
          label="City"
          placeholder="Select a City"
          options={availableCities.map(c => ({ value: c.id, label: c.city_name }))}
          registerProps={register('cityId')}
          error={errors.cityId?.message as string}
        />

        <FloatingSelect 
          id="sublocationId"
          label={cityId ? "Sublocation (Area)" : "Select City First"}
          placeholder={cityId ? "Select a Sublocation" : "Select City First"}
          options={filteredSublocations.map(s => ({ value: s.id, label: s.locality_name }))}
          registerProps={register('sublocationId')}
          disabled={!cityId}
          error={errors.sublocationId?.message as string}
        />

        <FloatingInput 
          id="state"
          label="State"
          registerProps={register('state')}
          error={errors.state?.message as string}
          readOnly
          className="!bg-gray-50 dark:!bg-[#0f1015] !text-gray-500 !cursor-not-allowed"
        />

        <FloatingInput 
          id="country"
          label="Country"
          registerProps={register('country')}
          error={errors.country?.message as string}
          readOnly
          className="!bg-gray-50 dark:!bg-[#0f1015] !text-gray-500 !cursor-not-allowed"
        />

        <div className="md:!col-span-2">
          <FloatingInput 
            id="addressLine1"
            label="Address Line 1"
            registerProps={register('addressLine1')}
            error={errors.addressLine1?.message as string}
          />
        </div>

        <FloatingInput 
          id="addressLine2"
          label="Address Line 2 (Optional)"
          registerProps={register('addressLine2')}
          error={errors.addressLine2?.message as string}
        />

        <FloatingInput 
          id="pincode"
          label="Pincode"
          registerProps={register('pincode')}
          error={errors.pincode?.message as string}
        />

      </div>
    </div>
  );
}
