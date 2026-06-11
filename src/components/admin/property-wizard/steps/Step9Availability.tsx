import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

export default function Step9Availability() {
 const { register, formState: { errors } } = useFormContext();

 return (
 <div className="!space-y-6">
 <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-5/50">
 Availability Details
 </h3>
 
 <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
 <div className="!space-y-1.5">
 <label htmlFor="availableFrom" className="!text-[14px] !font-semibold !text-gray-800">Available From</label>
 <input 
 id="availableFrom"
 type="date"
 {...register('availableFrom')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 />
 {errors.availableFrom && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.availableFrom.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="availableUntil" className="!text-[14px] !font-semibold !text-gray-800">Available Until (Optional)</label>
 <input 
 id="availableUntil"
 type="date"
 {...register('availableUntil')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 />
 {errors.availableUntil && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.availableUntil.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="availabilityStatus" className="!text-[14px] !font-semibold !text-gray-800">Availability Status</label>
 <div className="!relative">
 <select 
 id="availabilityStatus"
 {...register('availabilityStatus')} 
 className="!w-full !appearance-none !bg-white !border !border-gray-200 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"
 >
 <option value="Available">Available</option>
 <option value="Reserved">Reserved</option>
 <option value="Sold">Sold</option>
 <option value="Rented">Rented</option>
 </select>
 <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400">
 <ChevronDown size={18} />
 </div>
 </div>
 {errors.availabilityStatus && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.availabilityStatus.message as string}</p>}
 </div>
 </div>
 </div>
 );
}
