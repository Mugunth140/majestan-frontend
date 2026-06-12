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
          <label className="!inline-flex !items-center !cursor-pointer">
            <input type="checkbox" className="!sr-only !peer" {...register('publishImmediately')} />
            <div className="!relative !w-11 !h-6 !bg-gray-200 peer-focus:!outline-none !rounded-full !peer dark:!bg-[#262730] peer-checked:after:!translate-x-full rtl:peer-checked:after:!-translate-x-full peer-checked:after:!border-white after:!content-[''] after:!absolute after:!top-[2px] after:!start-[2px] after:!bg-white after:!border-gray-300 after:!border after:!rounded-full after:!h-5 after:!w-5 after:!transition-all dark:!border-gray-600 peer-checked:!bg-[#27427f]"></div>
            <span className="!ms-3 !text-sm !font-medium !text-gray-700 dark:!text-gray-300">Publish immediately on website</span>
          </label>
        </div>

      </div>
    </div>
  );
}
