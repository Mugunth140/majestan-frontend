import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step7OwnerInfo({ isAdmin }: { isAdmin: boolean }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="!space-y-6">
      <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-4 !pb-2 !border-b !border-gray-200/50">
        {isAdmin ? 'Owner / Agent Details' : 'Your Contact Details'}
      </h3>
      
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
        <div className="!space-y-2">
          <label htmlFor="ownerName" className="!text-[14px] !font-semibold !text-gray-800">Owner Name</label>
          <input 
            id="ownerName"
            {...register('ownerName')} 
            className="!w-full !bg-white/30 !backdrop-blur-md !border !border-white/50 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-4 focus:!ring-blue-500/20 focus:!border-white/80 !shadow-inner !outline-none !transition-all" 
            placeholder="John Doe" 
          />
          {errors.ownerName && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.ownerName.message as string}</p>}
        </div>

        <div className="!space-y-2">
          <label htmlFor="ownerEmail" className="!text-[14px] !font-semibold !text-gray-800">Email Address</label>
          <input 
            id="ownerEmail"
            type="email"
            {...register('ownerEmail')} 
            className="!w-full !bg-white/30 !backdrop-blur-md !border !border-white/50 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-4 focus:!ring-blue-500/20 focus:!border-white/80 !shadow-inner !outline-none !transition-all" 
            placeholder="john@example.com" 
          />
          {errors.ownerEmail && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.ownerEmail.message as string}</p>}
        </div>

        <div className="!space-y-2">
          <label htmlFor="ownerPhone" className="!text-[14px] !font-semibold !text-gray-800">Phone Number</label>
          <input 
            id="ownerPhone"
            {...register('ownerPhone')} 
            readOnly={!isAdmin} // Phone is readonly for end-users as they authenticate via phone
            className={`!w-full !border !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !shadow-inner !outline-none !transition-all ${
              !isAdmin 
                ? '!bg-white/10 !backdrop-blur-sm !border-white/30 !text-gray-500 !cursor-not-allowed' 
                : '!bg-white/30 !backdrop-blur-md !border-white/50 !text-gray-800 focus:!ring-4 focus:!ring-blue-500/20 focus:!border-white/80'
            }`} 
            placeholder="+91 99999 99999" 
          />
          {errors.ownerPhone && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.ownerPhone.message as string}</p>}
          {!isAdmin && <p className="!text-[11px] !text-gray-500 !mt-1">Phone number is linked to your authenticated session.</p>}
        </div>
      </div>
    </div>
  );
}
