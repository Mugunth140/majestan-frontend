import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect, FloatingTextarea } from '../ui/FloatingInput';

export default function Step1BasicInfo() {
  const { register, formState: { errors } } = useFormContext();

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
