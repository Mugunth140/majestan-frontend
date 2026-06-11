import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';

export default function Step4Specifications() {
  const { register, formState: { errors } } = useFormContext();

  const toOptions = (arr: string[]) => arr.map(item => ({ value: item, label: item }));

  return (
    <div className="!space-y-10">
      
      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Basic Specs</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          <FloatingInput id="bedrooms" label="Bedrooms" type="number" registerProps={register('bedrooms')} error={errors.bedrooms?.message as string} />
          <FloatingInput id="bathrooms" label="Bathrooms" type="number" registerProps={register('bathrooms')} error={errors.bathrooms?.message as string} />
          <FloatingInput id="balconies" label="Balconies" type="number" registerProps={register('balconies')} error={errors.balconies?.message as string} />
          <FloatingInput id="parkingSpaces" label="Parking" type="number" registerProps={register('parkingSpaces')} error={errors.parkingSpaces?.message as string} />
          <FloatingInput id="floorNumber" label="Floor No." type="number" registerProps={register('floorNumber')} error={errors.floorNumber?.message as string} />
          <FloatingInput id="totalFloors" label="Total Floors" type="number" registerProps={register('totalFloors')} error={errors.totalFloors?.message as string} />
        </div>
      </div>

      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Area Details</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          <FloatingSelect id="areaUnit" label="Unit" options={toOptions(['Sq Ft', 'Sq M', 'Acres', 'Cents'])} registerProps={register('areaUnit')} error={errors.areaUnit?.message as string} />
          <FloatingInput id="carpetArea" label="Carpet Area" type="number" registerProps={register('carpetArea')} error={errors.carpetArea?.message as string} />
          <FloatingInput id="builtUpArea" label="Built Up Area" type="number" registerProps={register('builtUpArea')} error={errors.builtUpArea?.message as string} />
          <FloatingInput id="superBuiltUpArea" label="Super Built Up" type="number" registerProps={register('superBuiltUpArea')} error={errors.superBuiltUpArea?.message as string} />
          <FloatingInput id="plotArea" label="Plot Area" type="number" registerProps={register('plotArea')} error={errors.plotArea?.message as string} />
        </div>
      </div>

      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Features</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          <FloatingSelect id="propertyFacing" label="Facing" options={toOptions(['East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West'])} registerProps={register('propertyFacing')} error={errors.propertyFacing?.message as string} />
          <FloatingSelect id="propertyAge" label="Age" options={toOptions(['New', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'])} registerProps={register('propertyAge')} error={errors.propertyAge?.message as string} />
          <FloatingSelect id="furnishing" label="Furnishing" options={toOptions(['Furnished', 'Semi Furnished', 'Unfurnished'])} registerProps={register('furnishing')} error={errors.furnishing?.message as string} />
          <FloatingSelect id="possessionStatus" label="Possession" options={toOptions(['Ready To Move', 'Under Construction', 'Immediate', 'Future Date'])} registerProps={register('possessionStatus')} error={errors.possessionStatus?.message as string} />
          <FloatingInput id="waterSupply" label="Water Supply" type="text" registerProps={register('waterSupply')} error={errors.waterSupply?.message as string} />
          <FloatingInput id="powerBackup" label="Power Backup" type="text" registerProps={register('powerBackup')} error={errors.powerBackup?.message as string} />
          <FloatingInput id="roadWidth" label="Road Width (ft)" type="number" registerProps={register('roadWidth')} error={errors.roadWidth?.message as string} />
          <FloatingInput id="openSides" label="Open Sides" type="number" registerProps={register('openSides')} error={errors.openSides?.message as string} />
        </div>
      </div>

    </div>
  );
}
