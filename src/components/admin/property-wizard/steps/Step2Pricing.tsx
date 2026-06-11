import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput } from '../ui/FloatingInput';

export default function Step2Pricing() {
  const { register, formState: { errors }, watch } = useFormContext();
  const listingType = watch('listingType');

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        
        <FloatingInput 
          id="price"
          type="number"
          label={listingType === 'Rent' ? 'Monthly Rent (₹)' : 'Total Price (₹)'}
          registerProps={register('price')}
          error={errors.price?.message as string}
        />

        <div className="!flex !items-center !h-full !pt-2">
          <label className="!flex !items-center !cursor-pointer !group">
            <div className="!relative !flex !items-center !justify-center !w-5 !h-5 !mr-3">
              <input
                id="negotiable"
                type="checkbox"
                {...register('negotiable')}
                className="!peer !appearance-none !w-5 !h-5 !border !border-gray-300 dark:!border-gray-600 !rounded-md checked:!bg-gray-900 checked:!border-gray-900 dark:checked:!bg-blue-600 dark:checked:!border-blue-600 !transition-all !cursor-pointer"
              />
              <svg className="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100 !pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="!text-sm !font-medium !text-gray-700 dark:!text-gray-300 group-hover:!text-gray-900 dark:group-hover:!text-white">Price is Negotiable</span>
          </label>
        </div>

        <FloatingInput 
          id="maintenanceCharges"
          type="number"
          label="Maintenance Charges (₹)"
          registerProps={register('maintenanceCharges')}
          error={errors.maintenanceCharges?.message as string}
        />

        <FloatingInput 
          id="securityDeposit"
          type="number"
          label={listingType === 'Rent' ? 'Security Deposit (₹)' : 'Booking Amount (₹)'}
          registerProps={register(listingType === 'Rent' ? 'securityDeposit' : 'bookingAmount')}
          error={(listingType === 'Rent' ? errors.securityDeposit?.message : errors.bookingAmount?.message) as string}
        />

      </div>
    </div>
  );
}
