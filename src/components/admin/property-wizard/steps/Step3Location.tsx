import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import type { AdminCity, AdminSublocation } from '@/lib/location-options';

interface Step3LocationProps {
 availableCities: AdminCity[];
 availableSublocations: AdminSublocation[];
}

export default function Step3Location({ availableCities, availableSublocations }: Step3LocationProps) {
 const { register, formState: { errors }, watch, setValue } = useFormContext();
 const cityId = watch('cityId');

 // Filter sublocations based on selected city
 const filteredSublocations = React.useMemo(() => {
 if (!cityId) return [];
 return availableSublocations.filter(sub => sub.city_id === Number(cityId));
 }, [cityId, availableSublocations]);

 // Update State & Country automatically when City is selected
 useEffect(() => {
 if (cityId) {
 const cityData = availableCities.find((c) => c.id === Number(cityId));
 if (cityData) {
 setValue('state', cityData.state_name);
 setValue('country', cityData.country_name || 'India');
 setValue('city', cityData.city_name);
 }
 }
 }, [cityId, availableCities, setValue]);

 return (
 <div className="!space-y-6">
 <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
 
 <div className="!space-y-1.5">
 <label htmlFor="cityId" className="!text-[14px] !font-semibold !text-gray-800">City</label>
 <div className="!relative">
 <select 
 id="cityId"
 {...register('cityId')} 
 className="!w-full !appearance-none !bg-white !border !border-gray-200 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm"
 >
 <option value="" disabled>Select City</option>
 {availableCities.map(city => (
 <option key={city.id} value={city.id}>{city.city_name}</option>
 ))}
 </select>
 <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400">
 <ChevronDown size={18} />
 </div>
 </div>
 {errors.cityId && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.cityId.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="sublocationId" className="!text-[14px] !font-semibold !text-gray-800">Sublocation (Area)</label>
 <div className="!relative">
 <select 
 id="sublocationId"
 {...register('sublocationId')} 
 disabled={!cityId}
 className="!w-full !appearance-none !bg-white !border !border-gray-200 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-3 !text-[14px] focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all !cursor-pointer !block !shadow-sm disabled:!opacity-50 disabled:!cursor-not-allowed"
 >
 <option value="" disabled>{cityId ? "Select Area" : "Select City First"}</option>
 {filteredSublocations.map(sub => (
 <option key={sub.id} value={sub.id}>{sub.locality_name}</option>
 ))}
 </select>
 <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400">
 <ChevronDown size={18} />
 </div>
 </div>
 {errors.sublocationId && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.sublocationId.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="state" className="!text-[14px] !font-semibold !text-gray-800">State</label>
 <input 
 id="state"
 {...register('state')} 
 readOnly
 className="!w-full !bg-gray-50 !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-500 !shadow-sm !outline-none !cursor-not-allowed" 
 />
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="country" className="!text-[14px] !font-semibold !text-gray-800">Country</label>
 <input 
 id="country"
 {...register('country')} 
 readOnly
 className="!w-full !bg-gray-50 !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-500 !shadow-sm !outline-none !cursor-not-allowed" 
 />
 </div>

 <div className="!space-y-1.5 md:!col-span-2">
 <label htmlFor="addressLine1" className="!text-[14px] !font-semibold !text-gray-800">Address Line 1</label>
 <input 
 id="addressLine1"
 {...register('addressLine1')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="Flat/House No, Building Name"
 />
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="addressLine2" className="!text-[14px] !font-semibold !text-gray-800">Address Line 2 (Optional)</label>
 <input 
 id="addressLine2"
 {...register('addressLine2')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="Street Name, Landmark"
 />
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="pincode" className="!text-[14px] !font-semibold !text-gray-800">Pincode</label>
 <input 
 id="pincode"
 {...register('pincode')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="E.g. 400001"
 />
 </div>

 </div>
 </div>
 );
}
