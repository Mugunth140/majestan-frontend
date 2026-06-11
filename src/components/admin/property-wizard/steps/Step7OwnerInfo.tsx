import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step7OwnerInfo({ isAdmin }: { isAdmin: boolean }) {
 const { register, formState: { errors } } = useFormContext();

 return (
 <div className="!space-y-6">
 <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-5/50">
 {isAdmin ? 'Owner / Agent Details' : 'Your Contact Details'}
 </h3>
 
 <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
 <div className="!space-y-1.5">
 <label htmlFor="ownerName" className="!text-[14px] !font-semibold !text-gray-800">Owner Name</label>
 <input 
 id="ownerName"
 {...register('ownerName')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="John Doe" 
 />
 {errors.ownerName && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.ownerName.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="ownerEmail" className="!text-[14px] !font-semibold !text-gray-800">Email Address</label>
 <input 
 id="ownerEmail"
 type="email"
 {...register('ownerEmail')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="john@example.com" 
 />
 {errors.ownerEmail && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.ownerEmail.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="ownerPhone" className="!text-[14px] !font-semibold !text-gray-800">Phone Number</label>
 <input 
 id="ownerPhone"
 {...register('ownerPhone')} 
 readOnly={!isAdmin} // Phone is readonly for end-users as they authenticate via phone
 className={`!w-full !border !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !shadow-sm !!outline-none !!transition-all ${
 !isAdmin 
 ? '!bg-gray-50 !border-gray-200 !text-gray-500 !cursor-not-allowed' 
 : '!bg-white !border-gray-200 !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500'
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
