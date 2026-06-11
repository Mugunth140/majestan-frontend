import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

export default function Step10Publishing() {
 const { register, formState: { errors } } = useFormContext();

 return (
 <div className="!space-y-6">
 <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
 <div className="!space-y-2">
 <label htmlFor="verificationStatus" className="!text-[14px] !font-semibold !text-gray-800">Verification Status</label>
 <div className="!relative">
 <select 
 id="verificationStatus"
 {...register('verificationStatus')} 
 className="!w-full !appearance-none !bg-white !border !border-gray-200 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"
 >
 <option value="Pending">Pending Review</option>
 <option value="Verified">Verified</option>
 <option value="Rejected">Rejected</option>
 </select>
 <div className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-500">
 <ChevronDown size={18} />
 </div>
 </div>
 {errors.verificationStatus && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.verificationStatus.message as string}</p>}
 </div>

 <div className="!space-y-2 !flex !items-center !h-full !pt-6">
 <label className="!flex !items-center !gap-3 !cursor-pointer">
 <div className="!relative !flex !items-center">
 <input 
 type="checkbox" 
 {...register('isPublished')} 
 className="!peer !appearance-none !w-6 !h-6 !border-2 !border-gray-300 !rounded-lg checked:!bg-emerald-500 checked:!border-emerald-500 !transition-all !cursor-pointer"
 />
 <svg className="!absolute !inset-0 !w-6 !h-6 !pointer-events-none !opacity-0 peer-checked:!opacity-100 !text-white !p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
 <polyline points="20 6 9 17 4 12"></polyline>
 </svg>
 </div>
 <span className="!text-[14px] !font-semibold !text-gray-800">Publish Immediately</span>
 </label>
 {errors.isPublished && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.isPublished.message as string}</p>}
 </div>

 <div className="!space-y-2 md:!col-span-2">
 <label htmlFor="adminNotes" className="!text-[14px] !font-semibold !text-gray-800">Admin Notes (Internal)</label>
 <textarea 
 id="adminNotes"
 {...register('adminNotes')} 
 rows={4}
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="Add any internal notes regarding this property's verification or status..." 
 />
 {errors.adminNotes && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.adminNotes.message as string}</p>}
 </div>
 </div>
 </div>
 );
}
