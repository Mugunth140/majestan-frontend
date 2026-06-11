import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';

export default function Step9Availability() {
  const { register, formState: { errors } } = useFormContext();

  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Reserved', label: 'Reserved' },
    { value: 'Sold', label: 'Sold' },
    { value: 'Rented', label: 'Rented' },
  ];

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        
        <FloatingInput 
          id="availableFrom"
          type="date"
          label="Available From"
          registerProps={register('availableFrom')}
          error={errors.availableFrom?.message as string}
        />

        <FloatingInput 
          id="availableUntil"
          type="date"
          label="Available Until (Optional)"
          registerProps={register('availableUntil')}
          error={errors.availableUntil?.message as string}
        />

        <FloatingSelect 
          id="availabilityStatus"
          label="Availability Status"
          options={statusOptions}
          registerProps={register('availabilityStatus')}
          error={errors.availabilityStatus?.message as string}
        />

      </div>
    </div>
  );
}
