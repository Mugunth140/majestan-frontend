'use client';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';
import { X, Plus } from 'lucide-react';

// ─── Field visibility per property type ──────────────────────────────────────
const FIELD_VISIBILITY_MAP: Record<string, string[]> = {
  apartment: ['bedrooms', 'bathrooms', 'balconies', 'floorNumber', 'totalFloors', 'carpetArea', 'superBuiltUpArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'possessionStatus', 'guestParking'],
  villa: ['bedrooms', 'bathrooms', 'balconies', 'totalFloors', 'plotArea', 'builtUpArea', 'carpetArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'openSides'],
  individual_portion: ['bedrooms', 'bathrooms', 'balconies', 'totalFloors', 'plotArea', 'builtUpArea', 'carpetArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'openSides'],
  plot: ['plotArea', 'areaUnit', 'plotSizeCents', 'plotLength', 'plotWidth', 'openSides', 'boundaryWall', 'roadWidth', 'propertyFacing', 'suitableFor'],
  farmland: ['plotArea', 'areaUnit', 'plotSizeCents', 'plotLength', 'plotWidth', 'openSides', 'boundaryWall', 'roadWidth', 'propertyFacing', 'suitableFor'],
  commercial: ['bathrooms', 'floorsOccupied', 'totalFloors', 'parkingSpaces', 'superBuiltUpArea', 'carpetArea', 'furnishing', 'hasPantry', 'hasCentralAc', 'powerBackup'],
  coworking: ['minSeats', 'rentPerSeat', 'privateCabins', 'meetingRooms', 'availableWorkstations', 'hasRestroom', 'floorNumber', 'totalFloors', 'parkingSpaces', 'carpetArea', 'powerBackup'],
  industrial: ['bathrooms', 'floorNumber', 'plotArea', 'builtUpArea', 'coveredArea', 'openArea', 'ceilingHeightFt', 'heavyVehicleAccess', 'powerBackup', 'roadWidth', 'truckParking', 'carParking', 'bikeParking', 'floorType', 'powerSupplyHp'],
  other: ['bedrooms', 'bathrooms', 'balconies', 'floorNumber', 'totalFloors', 'plotArea', 'builtUpArea', 'carpetArea', 'superBuiltUpArea', 'furnishing', 'parkingSpaces', 'propertyFacing', 'propertyAge', 'possessionStatus', 'waterSupply', 'powerBackup', 'roadWidth', 'openSides', 'plotLength', 'plotWidth', 'boundaryWall', 'suitableFor', 'hasPantry', 'hasCentralAc', 'ceilingHeightFt', 'heavyVehicleAccess'],
};

// ─── Floor options for commercial chip input ─────────────────────────────────
const FLOOR_OPTIONS = [
  'Basement', 'Ground', '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th', '11th', '12th',
  '13th', '14th', '15th', 'Above 15th',
];

// ─── Reusable toggle ──────────────────────────────────────────────────────────
function ToggleField({ label, fieldName }: { label: string; fieldName: string }) {
  const { register } = useFormContext();
  return (
    <div className="!flex !items-center !h-[50px] !pl-1">
      <label className="!flex !items-center !cursor-pointer">
        <div className="!relative">
          <input type="checkbox" className="sr-only peer" {...register(fieldName)} />
          <div className="!block !bg-gray-200 dark:!bg-[#262730] peer-checked:!bg-[#27427f] !w-10 !h-6 !rounded-full !transition-colors" />
          <div className="!absolute !left-1 !top-1 !bg-white peer-checked:!translate-x-full !w-4 !h-4 !rounded-full !transition-transform" />
        </div>
        <div className="!ml-3 !text-[13px] !font-medium !text-gray-700 dark:!text-gray-300">{label}</div>
      </label>
    </div>
  );
}

// ─── Floor chip input (commercial) ───────────────────────────────────────────
function FloorsOccupiedInput() {
  const { watch, setValue } = useFormContext();
  const floors: string[] = watch('floorsOccupied') || [];
  const [selected, setSelected] = useState('');

  const addFloor = () => {
    if (!selected || floors.includes(selected)) return;
    setValue('floorsOccupied', [...floors, selected], { shouldDirty: true });
    setSelected('');
  };

  const removeFloor = (f: string) => {
    setValue('floorsOccupied', floors.filter(x => x !== f), { shouldDirty: true });
  };

  return (
    <div className="!col-span-2 md:!col-span-4">
      <label className="!block !text-[13px] !font-bold !text-gray-700 dark:!text-gray-300 !uppercase !tracking-wider !mb-3">
        Floors Occupied
      </label>
      <div className="!flex !items-center !gap-3 !mb-3">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="!flex-1 !h-11 !px-3 !rounded-xl !border !border-gray-200 dark:!border-[#262730] !bg-white dark:!bg-[#171821] !text-gray-900 dark:!text-white !text-sm !outline-none focus:!border-[#27427f]"
        >
          <option value="">Select floor...</option>
          {FLOOR_OPTIONS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={addFloor}
          className="!flex !items-center !gap-1.5 !px-4 !py-2 !bg-[#27427f] !text-white !rounded-xl !text-sm !font-bold !transition-all hover:!opacity-90"
        >
          <Plus size={15} /> Add
        </button>
      </div>
      {floors.length > 0 && (
        <div className="!flex !flex-wrap !gap-2">
          {floors.map(f => (
            <span
              key={f}
              className="!inline-flex !items-center !gap-1.5 !px-3 !py-1.5 !bg-blue-50 dark:!bg-blue-500/10 !text-[#27427f] dark:!text-blue-400 !rounded-lg !text-sm !font-medium"
            >
              {f}
              <button
                type="button"
                onClick={() => removeFloor(f)}
                className="!text-blue-400 hover:!text-red-500 !transition-colors"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Step4Specifications() {
  const { register, watch, formState: { errors } } = useFormContext();
  const propertyType = watch('propertyType') || 'apartment';
  const visibleFields = FIELD_VISIBILITY_MAP[propertyType] || FIELD_VISIBILITY_MAP['other'];

  const show = (field: string) => visibleFields.includes(field);
  const toOptions = (arr: string[]) => arr.map(item => ({ value: item, label: item }));

  const isPlotLike = propertyType === 'plot' || propertyType === 'farmland';
  const isCoworking = propertyType === 'coworking';
  const isCommercial = propertyType === 'commercial';
  const isIndustrial = propertyType === 'industrial';
  const isApartment = propertyType === 'apartment';

  return (
    <div className="!space-y-10">

      {/* ── Basic Specs ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Basic Specs</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
          {show('bedrooms') && <FloatingInput id="bedrooms" label="Bedrooms" type="number" registerProps={register('bedrooms')} error={errors.bedrooms?.message as string} />}
          {show('bathrooms') && <FloatingInput id="bathrooms" label={isCommercial || isCoworking || isIndustrial ? 'Washrooms' : 'Bathrooms'} type="number" registerProps={register('bathrooms')} error={errors.bathrooms?.message as string} />}
          {show('balconies') && <FloatingInput id="balconies" label="Balconies" type="number" registerProps={register('balconies')} error={errors.balconies?.message as string} />}
          {show('parkingSpaces') && <FloatingInput id="parkingSpaces" label="Parking Spaces" type="number" registerProps={register('parkingSpaces')} error={errors.parkingSpaces?.message as string} />}
          {show('floorNumber') && <FloatingInput id="floorNumber" label="Floor No." type="number" registerProps={register('floorNumber')} error={errors.floorNumber?.message as string} />}
          {show('totalFloors') && <FloatingInput id="totalFloors" label="Total Floors" type="number" registerProps={register('totalFloors')} error={errors.totalFloors?.message as string} />}
          {show('ceilingHeightFt') && <FloatingInput id="ceilingHeightFt" label="Ceiling Height (Ft)" type="number" registerProps={register('ceilingHeightFt')} error={errors.ceilingHeightFt?.message as string} />}
        </div>
      </div>

      {/* ── Plot Dimensions (plot / farmland) ────────────────────────────── */}
      {isPlotLike && (
        <div>
          <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Plot Size & Dimensions</h3>
          <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
            {show('areaUnit') && (
              <FloatingSelect
                id="areaUnit"
                label="Area Unit"
                options={toOptions(['Sq Ft', 'Sq M', 'Acres', 'Cents'])}
                registerProps={register('areaUnit')}
                error={errors.areaUnit?.message as string}
              />
            )}
            {show('plotArea') && <FloatingInput id="plotArea" label="Total Plot Area" type="number" registerProps={register('plotArea')} error={errors.plotArea?.message as string} />}
            {show('plotSizeCents') && <FloatingInput id="plotSizeCents" label="Plot Size (Cents)" type="number" registerProps={register('plotSizeCents')} error={errors.plotSizeCents?.message as string} />}
            {/* Dimensions row with visual separator */}
            {(show('plotLength') || show('plotWidth')) && (
              <div className="!col-span-2 !flex !items-center !gap-3">
                {show('plotLength') && (
                  <FloatingInput id="plotLength" label="Length (Ft)" type="number" registerProps={register('plotLength')} error={errors.plotLength?.message as string} />
                )}
                <span className="!text-xl !font-bold !text-gray-400 !mt-1">×</span>
                {show('plotWidth') && (
                  <FloatingInput id="plotWidth" label="Width (Ft)" type="number" registerProps={register('plotWidth')} error={errors.plotWidth?.message as string} />
                )}
              </div>
            )}
            {show('openSides') && <FloatingInput id="openSides" label="Open Sides" type="number" registerProps={register('openSides')} error={errors.openSides?.message as string} />}
            {show('roadWidth') && <FloatingInput id="roadWidth" label="Road Width (ft)" type="number" registerProps={register('roadWidth')} error={errors.roadWidth?.message as string} />}
            {show('suitableFor') && <FloatingInput id="suitableFor" label="Suitable For" type="text" registerProps={register('suitableFor')} error={errors.suitableFor?.message as string} />}
            {show('propertyFacing') && (
              <FloatingSelect id="propertyFacing" label="Facing" options={toOptions(['', 'East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West'])} registerProps={register('propertyFacing')} error={errors.propertyFacing?.message as string} />
            )}
            {show('boundaryWall') && <ToggleField label="Boundary Wall" fieldName="boundaryWall" />}
          </div>
        </div>
      )}

      {/* ── Area Details (non-plot types) ─────────────────────────────────── */}
      {!isPlotLike && !isCoworking && (
        <div>
          <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Area Details</h3>
          <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
            {show('carpetArea') && <FloatingInput id="carpetArea" label="Carpet Area (Sq Ft)" type="number" registerProps={register('carpetArea')} error={errors.carpetArea?.message as string} />}
            {show('builtUpArea') && <FloatingInput id="builtUpArea" label="Built Up Area (Sq Ft)" type="number" registerProps={register('builtUpArea')} error={errors.builtUpArea?.message as string} />}
            {show('superBuiltUpArea') && <FloatingInput id="superBuiltUpArea" label="Super Built Up (Sq Ft)" type="number" registerProps={register('superBuiltUpArea')} error={errors.superBuiltUpArea?.message as string} />}
            {show('plotArea') && <FloatingInput id="plotArea" label="Plot Area (Sq Ft)" type="number" registerProps={register('plotArea')} error={errors.plotArea?.message as string} />}
            {/* Industrial-specific area fields */}
            {show('coveredArea') && <FloatingInput id="coveredArea" label="Covered Area (Sq Ft)" type="number" registerProps={register('coveredArea')} error={errors.coveredArea?.message as string} />}
            {show('openArea') && <FloatingInput id="openArea" label="Open Area (Sq Ft)" type="number" registerProps={register('openArea')} error={errors.openArea?.message as string} />}
          </div>
        </div>
      )}

      {/* ── Coworking Details ─────────────────────────────────────────────── */}
      {isCoworking && (
        <div>
          <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Coworking Details</h3>
          <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
            <FloatingInput id="minSeats" label="Min. Seat Quantity" type="number" registerProps={register('minSeats')} error={errors.minSeats?.message as string} />
            <FloatingInput id="rentPerSeat" label="Rent Per Seat (₹)" type="number" registerProps={register('rentPerSeat')} error={errors.rentPerSeat?.message as string} />
            <FloatingInput id="privateCabins" label="Private Cabins (nos)" type="number" registerProps={register('privateCabins')} error={errors.privateCabins?.message as string} />
            <FloatingInput id="meetingRooms" label="Meeting Rooms (nos)" type="number" registerProps={register('meetingRooms')} error={errors.meetingRooms?.message as string} />
            <FloatingInput id="availableWorkstations" label="Available Workstations" type="number" registerProps={register('availableWorkstations')} error={errors.availableWorkstations?.message as string} />
            <ToggleField label="Restroom Available" fieldName="hasRestroom" />
          </div>
          <div className="!mt-6 !grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
            <FloatingInput id="carpetArea" label="Total Area (Sq Ft)" type="number" registerProps={register('carpetArea')} error={errors.carpetArea?.message as string} />
            <FloatingInput id="floorNumber" label="Floor No." type="number" registerProps={register('floorNumber')} error={errors.floorNumber?.message as string} />
            <FloatingInput id="totalFloors" label="Total Floors" type="number" registerProps={register('totalFloors')} error={errors.totalFloors?.message as string} />
            <FloatingInput id="parkingSpaces" label="Parking Spaces" type="number" registerProps={register('parkingSpaces')} error={errors.parkingSpaces?.message as string} />
            <FloatingInput id="powerBackup" label="Power Backup" type="text" registerProps={register('powerBackup')} error={errors.powerBackup?.message as string} />
          </div>
        </div>
      )}

      {/* ── Commercial: Floors Occupied ──────────────────────────────────── */}
      {isCommercial && (
        <div>
          <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Floor Details</h3>
          <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
            <FloorsOccupiedInput />
            <FloatingInput id="totalFloors" label="Total Floors in Building" type="number" registerProps={register('totalFloors')} error={errors.totalFloors?.message as string} />
          </div>
        </div>
      )}

      {/* ── Industrial: Parking & Infrastructure ─────────────────────────── */}
      {isIndustrial && (
        <div>
          <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Industrial Details</h3>
          <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-x-5 !gap-y-6">
            <FloatingInput id="truckParking" label="Truck Parking (nos)" type="number" registerProps={register('truckParking')} error={errors.truckParking?.message as string} />
            <FloatingInput id="carParking" label="Car Parking (nos)" type="number" registerProps={register('carParking')} error={errors.carParking?.message as string} />
            <FloatingInput id="bikeParking" label="Bike Parking (nos)" type="number" registerProps={register('bikeParking')} error={errors.bikeParking?.message as string} />
            <FloatingInput id="floorType" label="Floor Type" type="text" registerProps={register('floorType')} error={errors.floorType?.message as string} />
            <FloatingInput id="powerSupplyHp" label="Power Supply (HP)" type="number" registerProps={register('powerSupplyHp')} error={errors.powerSupplyHp?.message as string} />
            <ToggleField label="Heavy Vehicle Access" fieldName="heavyVehicleAccess" />
          </div>
        </div>
      )}

      {/* ── Features ─────────────────────────────────────────────────────── */}
      {!isPlotLike && !isCoworking && (
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
            {show('hasPantry') && <ToggleField label="Has Pantry" fieldName="hasPantry" />}
            {show('hasCentralAc') && <ToggleField label="Central AC" fieldName="hasCentralAc" />}
            {/* Apartment: guest parking */}
            {isApartment && <ToggleField label="Guest Parking Available" fieldName="guestParking" />}
          </div>
        </div>
      )}

    </div>
  );
}
