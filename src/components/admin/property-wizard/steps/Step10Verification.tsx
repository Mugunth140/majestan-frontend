import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingSelect } from '../ui/FloatingInput';

export default function Step10Verification() {
  const { register, formState: { errors } } = useFormContext();

  const verifyOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const approveOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        
        <FloatingSelect 
          id="verificationStatus"
          label="Verification Status"
          options={verifyOptions}
          registerProps={register('verificationStatus')}
          error={errors.verificationStatus?.message as string}
        />

        <FloatingSelect 
          id="approvalStatus"
          label="Approval Status"
          options={approveOptions}
          registerProps={register('approvalStatus')}
          error={errors.approvalStatus?.message as string}
        />

        <div className="md:!col-span-2 !flex !items-center !h-full !pt-2">
          <label className="!flex !items-center !cursor-pointer !group">
            <div className="!relative !flex !items-center !justify-center !w-5 !h-5 !mr-3">
              <input
                id="publishImmediately"
                type="checkbox"
                {...register('publishImmediately')}
                className="!peer !appearance-none !w-5 !h-5 !border !border-gray-300 dark:!border-gray-600 !rounded-md checked:!bg-gray-900 checked:!border-gray-900 dark:checked:!bg-blue-600 dark:checked:!border-blue-600 !transition-all !cursor-pointer"
              />
              <svg className="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100 !pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="!text-sm !font-medium !text-gray-700 dark:!text-gray-300 group-hover:!text-gray-900 dark:group-hover:!text-white">Publish immediately on website</span>
          </label>
        </div>

      </div>
    </div>
  );
}
