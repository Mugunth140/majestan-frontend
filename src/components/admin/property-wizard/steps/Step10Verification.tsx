import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

export default function Step10Verification() {
 const { register, formState: { errors } } = useFormContext();

 return (
 <div className="!space-y-6">
 <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-5/50">
 Verification & Publishing (Admin Only)
 </h3>
 
 <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
 <div className="!space-y-1.5">
 <label htmlFor="verificationStatus" className="!text-[14px] !font-semibold !text-gray-800">Verification Status</label>
 <div className="!relative">
 <select 
 id="verificationStatus"
 {...register('verificationStatus')} 
 className="!w-full !appearance-none !bg-white !border !border-gray-200 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"
 >
 <option value="Pending">Pending</option>
 <option value="Verified">Verified</option>
 <option value="Rejected">Rejected</option>
 </select>
 <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400">
 <ChevronDown size={18} />
 </div>
 </div>
 {errors.verificationStatus && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.verificationStatus.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="approvalStatus" className="!text-[14px] !font-semibold !text-gray-800">Approval Status</label>
 <div className="!relative">
 <select 
 id="approvalStatus"
 {...register('approvalStatus')} 
 className="!w-full !appearance-none !bg-white !border !border-gray-200 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"
 >
 <option value="Pending">Pending</option>
 <option value="Approved">Approved</option>
 <option value="Rejected">Rejected</option>
 </select>
 <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400">
 <ChevronDown size={18} />
 </div>
 </div>
 {errors.approvalStatus && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.approvalStatus.message as string}</p>}
 </div>

 <div className="!space-y-1.5 md:!col-span-2 !flex !items-center !h-full !pt-4">
 <label className="!flex !items-center !cursor-pointer !group">
 <div className="!relative !flex !items-center !justify-center !w-5 !h-5 !mr-3">
 <input
 id="publishImmediately"
 type="checkbox"
 {...register('publishImmediately')}
 className="!peer !appearance-none !w-5 !h-5 !border !border-gray-300 !rounded-md checked:!bg-blue-600 checked:!border-blue-600 !transition-all !cursor-pointer"
 />
 <svg className="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100 !pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <span className="!text-sm !font-medium !text-gray-700 group-hover:!text-gray-900">Publish immediately on website</span>
 </label>
 </div>
 </div>
 </div>
 );
}
