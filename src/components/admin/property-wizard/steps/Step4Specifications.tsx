import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';

const FIELD_VISIBILITY_MAP: Record<string, string[]> = {
  apartment: ['bedrooms', 'bathrooms', 'balconies', 'floorNumber', 'totalFloors', 'carpetArea', 'superBuiltUpArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'possessionStatus'],
  villa: ['bedrooms', 'bathrooms', 'balconies', 'totalFloors', 'plotArea', 'builtUpArea', 'carpetArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'openSides'],
  individual_portion: ['bedrooms', 'bathrooms', 'balconies', 'totalFloors', 'plotArea', 'builtUpArea', 'carpetArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'openSides'],
  plot: ['plotArea', 'areaUnit', 'plotLength', 'plotWidth', 'openSides', 'boundaryWall', 'roadWidth', 'propertyFacing', 'suitableFor'],
  farmland: ['plotArea', 'areaUnit', 'plotLength', 'plotWidth', 'openSides', 'boundaryWall', 'roadWidth', 'propertyFacing', 'suitableFor'],
  commercial: ['bathrooms', 'floorNumber', 'totalFloors', 'parkingSpaces', 'superBuiltUpArea', 'carpetArea', 'furnishing', 'hasPantry', 'hasCentralAc', 'powerBackup'],
  coworking: ['bathrooms', 'floorNumber', 'totalFloors', 'parkingSpaces', 'superBuiltUpArea', 'carpetArea', 'furnishing', 'hasPantry', 'hasCentralAc', 'powerBackup'],
  industrial: ['bathrooms', 'floorNumber', 'plotArea', 'builtUpArea', 'ceilingHeightFt', 'heavyVehicleAccess', 'powerBackup', 'roadWidth'],
  other: ['bedrooms', 'bathrooms', 'balconies', 'floorNumber', 'totalFloors', 'plotArea', 'builtUpArea', 'carpetArea', 'superBuiltUpArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'possessionStatus', 'waterSupply', 'powerBackup', 'roadWidth', 'openSides', 'plotLength', 'plotWidth', 'boundaryWall', 'suitableFor', 'hasPantry', 'hasCentralAc', 'ceilingHeightFt', 'heavyVehicleAccess']
};

export default function Step4Specifications() {
  const { register, watch, formState: { errors } } = useFormContext();
  const propertyType = watch('propertyType') || 'apartment';
  const visibleFields = FIELD_VISIBILITY_MAP[propertyType] || FIELD_VISIBILITY_MAP['other'];

  const show = (field: string) => visibleFields.includes(field);
  const toOptions = (arr: string[]) => arr.map(item => ({ value: item, label: item }));

  return (
    <div className="!space-y-10">
      
      {/* Basic Specs */}
      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Basic Specs</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          {show('bedrooms') && <FloatingInput id="bedrooms" label="Bedrooms" type="number" registerProps={register('bedrooms')} error={errors.bedrooms?.message as string} />}
          {show('bathrooms') && <FloatingInput id="bathrooms" label={propertyType === 'commercial' || propertyType === 'coworking' || propertyType === 'industrial' ? "Washrooms" : "Bathrooms"} type="number" registerProps={register('bathrooms')} error={errors.bathrooms?.message as string} />}
          {show('balconies') && <FloatingInput id="balconies" label="Balconies" type="number" registerProps={register('balconies')} error={errors.balconies?.message as string} />}
          {show('parkingSpaces') && <FloatingInput id="parkingSpaces" label="Parking Spaces" type="number" registerProps={register('parkingSpaces')} error={errors.parkingSpaces?.message as string} />}
          {show('floorNumber') && <FloatingInput id="floorNumber" label="Floor No." type="number" registerProps={register('floorNumber')} error={errors.floorNumber?.message as string} />}
          {show('totalFloors') && <FloatingInput id="totalFloors" label="Total Floors" type="number" registerProps={register('totalFloors')} error={errors.totalFloors?.message as string} />}
          {show('ceilingHeightFt') && <FloatingInput id="ceilingHeightFt" label="Ceiling Height (Ft)" type="number" registerProps={register('ceilingHeightFt')} error={errors.ceilingHeightFt?.message as string} />}
        </div>
      </div>

      {/* Area Details */}
      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Area Details</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          {show('areaUnit') && <FloatingSelect id="areaUnit" label="Unit" options={toOptions(['Sq Ft', 'Sq M', 'Acres', 'Cents'])} registerProps={register('areaUnit')} error={errors.areaUnit?.message as string} />}
          {show('carpetArea') && <FloatingInput id="carpetArea" label="Carpet Area" type="number" registerProps={register('carpetArea')} error={errors.carpetArea?.message as string} />}
          {show('builtUpArea') && <FloatingInput id="builtUpArea" label="Built Up Area" type="number" registerProps={register('builtUpArea')} error={errors.builtUpArea?.message as string} />}
          {show('superBuiltUpArea') && <FloatingInput id="superBuiltUpArea" label="Super Built Up" type="number" registerProps={register('superBuiltUpArea')} error={errors.superBuiltUpArea?.message as string} />}
          {show('plotArea') && <FloatingInput id="plotArea" label="Plot Area" type="number" registerProps={register('plotArea')} error={errors.plotArea?.message as string} />}
          {show('plotLength') && <FloatingInput id="plotLength" label="Plot Length (Ft)" type="number" registerProps={register('plotLength')} error={errors.plotLength?.message as string} />}
          {show('plotWidth') && <FloatingInput id="plotWidth" label="Plot Width (Ft)" type="number" registerProps={register('plotWidth')} error={errors.plotWidth?.message as string} />}
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Features</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          {show('propertyFacing') && <FloatingSelect id="propertyFacing" label="Facing" options={toOptions(['', 'East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West'])} registerProps={register('propertyFacing')} error={errors.propertyFacing?.message as string} />}
          {show('propertyAge') && <FloatingSelect id="propertyAge" label="Age" options={toOptions(['', 'New', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'])} registerProps={register('propertyAge')} error={errors.propertyAge?.message as string} />}
          {show('furnishing') && <FloatingSelect id="furnishing" label="Furnishing" options={toOptions(['', 'Furnished', 'Semi Furnished', 'Unfurnished'])} registerProps={register('furnishing')} error={errors.furnishing?.message as string} />}
          {show('possessionStatus') && <FloatingSelect id="possessionStatus" label="Possession" options={toOptions(['', 'Ready To Move', 'Under Construction', 'Immediate', 'Future Date'])} registerProps={register('possessionStatus')} error={errors.possessionStatus?.message as string} />}
          
          {show('waterSupply') && <FloatingInput id="waterSupply" label="Water Supply" type="text" registerProps={register('waterSupply')} error={errors.waterSupply?.message as string} />}
          {show('powerBackup') && <FloatingInput id="powerBackup" label="Power Backup" type="text" registerProps={register('powerBackup')} error={errors.powerBackup?.message as string} />}
          {show('roadWidth') && <FloatingInput id="roadWidth" label="Road Width (ft)" type="number" registerProps={register('roadWidth')} error={errors.roadWidth?.message as string} />}
          {show('openSides') && <FloatingInput id="openSides" label="Open Sides" type="number" registerProps={register('openSides')} error={errors.openSides?.message as string} />}
          {show('suitableFor') && <FloatingInput id="suitableFor" label="Suitable For" type="text" registerProps={register('suitableFor')} error={errors.suitableFor?.message as string} />}
          
          {show('boundaryWall') && (
            <div className="!flex !items-center !h-[50px] !pl-1">
              <label className="!flex !items-center !cursor-pointer">
                <div className="!relative">
                  <input type="checkbox" className="sr-only peer" {...register('boundaryWall')} />
                  <div className="!block !bg-gray-200 dark:!bg-[#262730] peer-checked:!bg-[#27427f] !w-10 !h-6 !rounded-full !transition-colors"></div>
                  <div className="!absolute !left-1 !top-1 !bg-white peer-checked:!translate-x-full !w-4 !h-4 !rounded-full !transition-transform"></div>
                </div>
                <div className="!ml-3 !text-[13px] !font-medium !text-gray-700 dark:!text-gray-300">Boundary Wall</div>
              </label>
            </div>
          )}
          {show('hasPantry') && (
            <div className="!flex !items-center !h-[50px] !pl-1">
              <label className="!flex !items-center !cursor-pointer">
                <div className="!relative">
                  <input type="checkbox" className="sr-only peer" {...register('hasPantry')} />
                  <div className="!block !bg-gray-200 dark:!bg-[#262730] peer-checked:!bg-[#27427f] !w-10 !h-6 !rounded-full !transition-colors"></div>
                  <div className="!absolute !left-1 !top-1 !bg-white peer-checked:!translate-x-full !w-4 !h-4 !rounded-full !transition-transform"></div>
                </div>
                <div className="!ml-3 !text-[13px] !font-medium !text-gray-700 dark:!text-gray-300">Has Pantry</div>
              </label>
            </div>
          )}
          {show('hasCentralAc') && (
            <div className="!flex !items-center !h-[50px] !pl-1">
              <label className="!flex !items-center !cursor-pointer">
                <div className="!relative">
                  <input type="checkbox" className="sr-only peer" {...register('hasCentralAc')} />
                  <div className="!block !bg-gray-200 dark:!bg-[#262730] peer-checked:!bg-[#27427f] !w-10 !h-6 !rounded-full !transition-colors"></div>
                  <div className="!absolute !left-1 !top-1 !bg-white peer-checked:!translate-x-full !w-4 !h-4 !rounded-full !transition-transform"></div>
                </div>
                <div className="!ml-3 !text-[13px] !font-medium !text-gray-700 dark:!text-gray-300">Central AC</div>
              </label>
            </div>
          )}
          {show('heavyVehicleAccess') && (
            <div className="!flex !items-center !h-[50px] !pl-1">
              <label className="!flex !items-center !cursor-pointer">
                <div className="!relative">
                  <input type="checkbox" className="sr-only peer" {...register('heavyVehicleAccess')} />
                  <div className="!block !bg-gray-200 dark:!bg-[#262730] peer-checked:!bg-[#27427f] !w-10 !h-6 !rounded-full !transition-colors"></div>
                  <div className="!absolute !left-1 !top-1 !bg-white peer-checked:!translate-x-full !w-4 !h-4 !rounded-full !transition-transform"></div>
                </div>
                <div className="!ml-3 !text-[13px] !font-medium !text-gray-700 dark:!text-gray-300">Heavy Vehicle Access</div>
              </label>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
