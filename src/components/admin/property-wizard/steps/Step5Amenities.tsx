import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, Search } from 'lucide-react';
import { FloatingInput } from '../ui/FloatingInput';

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

  const groupedAmenities = filteredAmenities.reduce((acc, amenity) => {
    const cat = amenity.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(amenity);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="!space-y-6">
      
      <div className="!relative !max-w-md">
        <div className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-gray-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search amenities..." 
          className="!w-full !bg-gray-50 dark:!bg-[#0f1015] !border !border-gray-200 dark:!border-[#262730] !rounded-xl !pl-11 !pr-4 !py-3 !text-[14px] !font-medium !text-gray-900 dark:!text-white focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !outline-none !transition-all"
        />
      </div>

      <div className="!space-y-8">
        {Object.entries(groupedAmenities).map(([category, ams]) => (
          <div key={category} className="!space-y-4">
            <h3 className="text-base! font-semibold! text-gray-700! dark:text-white! capitalize!  !tracking-wide !border-b !border-gray-100 dark:!border-gray-800 !pb-2">
              {category.replace(/-/g, ' ')}
            </h3>
            <div className="!grid !grid-cols-2 md:!grid-cols-3 lg:!grid-cols-4 !gap-4">
              {(ams as any[]).map(amenity => {
                const isSelected = selectedIds.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`!flex !items-center !gap-3 !p-3.5 !rounded-xl !border !text-sm !font-medium !transition-all ${
                      isSelected 
                        ? '!bg-gray-900 dark:!bg-blue-600 !border-gray-900 dark:!border-blue-600 !text-white !shadow-sm !ring-2 !ring-gray-900/10 dark:!ring-blue-500/20' 
                        : '!bg-white dark:!bg-[#171821] !border-gray-200 dark:!border-[#262730] !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] hover:!border-gray-300 dark:hover:!border-gray-600 !shadow-sm'
                    }`}
                  >
                    <div className={`!w-5 !h-5 !rounded !flex !items-center !justify-center !transition-colors ${
                      isSelected ? '!bg-white/20 !border-transparent' : '!bg-white dark:!bg-[#0f1015] !border !border-gray-300 dark:!border-gray-600'
                    }`}>
                      {isSelected && <Check size={14} className="!text-white" />}
                    </div>
                    {amenity.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        
        {filteredAmenities.length === 0 && (
          <div className="!col-span-full !py-8 !text-center !text-[14px] !text-gray-500 !font-medium">
            No amenities found matching "{searchTerm}"
          </div>
        )}
      </div>

    </div>
  );
}
