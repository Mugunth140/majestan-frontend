import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, Search } from 'lucide-react';

export default function Step5Amenities({ amenities = [] }: { amenities: any[] }) {
 const { watch, setValue } = useFormContext();
 const [searchTerm, setSearchTerm] = useState('');
 
 const selectedIds: number[] = watch('amenityIds') || [];

 const toggleAmenity = (id: number) => {
 const newSelection = selectedIds.includes(id)
 ? selectedIds.filter(aId => aId !== id)
 : [...selectedIds, id];
 setValue('amenityIds', newSelection, { shouldValidate: true, shouldDirty: true });
 };

 const filteredAmenities = amenities.filter(a => 
 a.name?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
 <div className="!space-y-6">
 
 {/* Search Bar */}
 <div className="!relative !max-w-md">
 <div className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-gray-400">
 <Search size={18} />
 </div>
 <input 
 type="text" 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search amenities..." 
 className="!w-full !bg-white !border !border-gray-200 !rounded-full !pl-11 !pr-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all"
 />
 </div>

 {/* Grid */}
 <div className="!grid !grid-cols-2 md:!grid-cols-3 lg:!grid-cols-4 !gap-4">
 {filteredAmenities.map(amenity => {
 const isSelected = selectedIds.includes(amenity.id);
 return (
 <button
 key={amenity.id}
 type="button"
 onClick={() => toggleAmenity(amenity.id)}
 className={`!flex !items-center !gap-3 !p-3 !rounded-2xl !border !text-[14px] !font-semibold !transition-all ${
 isSelected 
 ? '!bg-blue-600 !border-blue-600 !text-white !shadow-lg !shadow-blue-500/20' 
 : '!bg-white !border-gray-200 !text-gray-700 hover:!bg-gray-50 !shadow-sm'
 }`}
 >
 <div className={`!w-5 !h-5 !rounded-md !border !flex !items-center !justify-center !transition-colors ${
 isSelected ? '!bg-blue-600 !border-blue-600' : '!bg-white !border-gray-300'
 }`}>
 {isSelected && <Check size={14} className="!text-white" />}
 </div>
 {amenity.name}
 </button>
 );
 })}
 {filteredAmenities.length === 0 && (
 <div className="!col-span-full !py-8 !text-center !text-[14px] !text-gray-500 !font-medium">
 No amenities found matching "{searchTerm}"
 </div>
 )}
 </div>

 </div>
 );
}
