import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step2Pricing() {
 const { register, formState: { errors }, watch } = useFormContext();
 const listingType = watch('listingType');

 return (
 <div className="!space-y-6">
 <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
 <div className="!space-y-1.5">
 <label htmlFor="price" className="!text-[14px] !font-semibold !text-gray-800 dark:!text-gray-100">
 {listingType === 'Rent' ? 'Monthly Rent (₹)' : 'Total Price (₹)'}
 </label>
 <input 
 id="price"
 type="number"
 {...register('price')} 
 className="!w-full !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 dark:!text-gray-100 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!ring-blue-500/20 dark:focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder={listingType === 'Rent' ? 'E.g. 25000' : 'E.g. 15000000'}
 />
 {errors.price && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.price.message as string}</p>}
 </div>

 <div className="!space-y-1.5 !flex !items-center !h-full !pt-8">
 <label className="!flex !items-center !cursor-pointer !group">
 <div className="!relative !flex !items-center !justify-center !w-5 !h-5 !mr-3">
 <input
 id="negotiable"
 type="checkbox"
 {...register('negotiable')}
 className="!peer !appearance-none !w-5 !h-5 !border !border-gray-300 dark:!border-gray-600 !rounded-md checked:!bg-blue-600 checked:!border-blue-600 !transition-all !cursor-pointer"
 />
 <svg className="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100 !pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <span className="!text-sm !font-medium !text-gray-700 dark:!text-gray-300 group-hover:!text-gray-900 dark:!text-white">Price is Negotiable</span>
 </label>
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="maintenanceCharges" className="!text-[14px] !font-semibold !text-gray-800 dark:!text-gray-100">Maintenance Charges (₹)</label>
 <input 
 id="maintenanceCharges"
 type="number"
 {...register('maintenanceCharges')} 
 className="!w-full !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 dark:!text-gray-100 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!ring-blue-500/20 dark:focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="E.g. 5000" 
 />
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="securityDeposit" className="!text-[14px] !font-semibold !text-gray-800 dark:!text-gray-100">
 {listingType === 'Rent' ? 'Security Deposit (₹)' : 'Booking Amount (₹)'}
 </label>
 <input 
 id="securityDeposit"
 type="number"
 {...register(listingType === 'Rent' ? 'securityDeposit' : 'bookingAmount')} 
 className="!w-full !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 dark:!text-gray-100 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 dark:focus:!ring-blue-500/20 dark:focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="E.g. 100000" 
 />
 </div>
 </div>
 </div>
 );
}
