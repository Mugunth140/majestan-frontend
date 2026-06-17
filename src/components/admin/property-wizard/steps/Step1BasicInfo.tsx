import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect, FloatingTextarea } from '../ui/FloatingInput';

export default function Step1BasicInfo() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();

  const propertyTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'plot', label: 'Plot' },
    { value: 'commercial', label: 'Commercial Space' },
    { value: 'coworking', label: 'Coworking' },
    { value: 'farmland', label: 'Farmland' },
    { value: 'industrial', label: 'Industrial Space' },
    { value: 'individual_portion', label: 'Individual House' },
  ];

  const listingTypeOptions = [
    { value: 'Sell', label: 'Sell' },
    { value: 'Rent', label: 'Rent' },
  ];

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        <div className="md:!col-span-2">
          <FloatingInput 
            id="title"
            label="Property Title"
            registerProps={register('title')}
            error={errors.title?.message as string}
          />
        </div>

        <FloatingSelect 
          id="propertyType"
          label="Property Type"
          options={propertyTypeOptions}
          registerProps={register('propertyType')}
          error={errors.propertyType?.message as string}
        />

        <FloatingSelect 
          id="listingType"
          label="Listing Type"
          options={listingTypeOptions}
          registerProps={register('listingType')}
          error={errors.listingType?.message as string}
        />

        <div className="md:!col-span-2 !space-y-3">
          <FloatingInput 
            id="reraNumber"
            label="RERA Number *"
            registerProps={register('reraNumber')}
            error={errors.reraNumber?.message as string}
          />
          <label className="!flex !items-center !gap-2 !cursor-pointer !ml-1">
            <input 
              type="checkbox" 
              className="!w-4 !h-4 !rounded !border-gray-300 !text-[#27427f] focus:!ring-[#27427f] !bg-white dark:!bg-[#0f1015]"
              onChange={(e) => {
                if (e.target.checked) {
                  setValue('reraNumber', 'Not Applicable', { shouldValidate: true, shouldDirty: true });
                } else {
                  setValue('reraNumber', '', { shouldValidate: true, shouldDirty: true });
                }
              }}
              checked={watch('reraNumber') === 'Not Applicable'}
            />
            <span className="!text-[13px] !font-medium !text-gray-600 dark:!text-gray-400">RERA Not Applicable</span>
          </label>
        </div>
      </div>

      <div className="!mt-8">
        <FloatingTextarea 
          id="description"
          label="Description"
          registerProps={register('description')}
          error={errors.description?.message as string}
        />
      </div>
    </div>
  );
}
