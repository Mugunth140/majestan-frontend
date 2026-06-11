import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput } from '../ui/FloatingInput';

export default function Step7OwnerInfo({ isAdmin }: { isAdmin: boolean }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        
        <FloatingInput 
          id="ownerName"
          label="Owner Name"
          registerProps={register('ownerName')}
          error={errors.ownerName?.message as string}
        />

        <FloatingInput 
          id="ownerEmail"
          type="email"
          label="Email Address"
          registerProps={register('ownerEmail')}
          error={errors.ownerEmail?.message as string}
        />

        <FloatingInput 
          id="ownerPhone"
          label="Phone Number"
          registerProps={register('ownerPhone')}
          error={errors.ownerPhone?.message as string}
          readOnly={!isAdmin}
          className={!isAdmin ? '!bg-gray-50 dark:!bg-[#0f1015] !text-gray-500 !cursor-not-allowed' : ''}
        />

      </div>
      {!isAdmin && <p className="!text-[12px] !text-gray-500 dark:!text-gray-400 !mt-2">Phone number is linked to your authenticated session.</p>}
    </div>
  );
}
