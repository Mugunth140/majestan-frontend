import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

export default function Step4Specifications() {
  const { register, formState: { errors } } = useFormContext();

  const InputField = ({ id, label, placeholder, type = "number" }: any) => (
    <div className="!space-y-2">
      <label htmlFor={id} className="!text-[13px] !font-semibold !text-gray-800">{label}</label>
      <input 
        id={id}
        type={type}
        {...register(id)} 
        className="!w-full !bg-white/30 !backdrop-blur-md !border !border-white/50 !rounded-xl !px-4 !py-2.5 !text-[14px] !font-medium !text-gray-800 focus:!ring-4 focus:!ring-blue-500/20 focus:!border-white/80 !shadow-inner !outline-none !transition-all" 
        placeholder={placeholder}
      />
      {errors[id] && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors[id]?.message as string}</p>}
    </div>
  );

  const SelectField = ({ id, label, options }: any) => (
    <div className="!space-y-2">
      <label htmlFor={id} className="!text-[13px] !font-semibold !text-gray-800">{label}</label>
      <div className="!relative">
        <select 
          id={id}
          {...register(id)} 
          className="!w-full !appearance-none !bg-white/30 !backdrop-blur-md !border !border-white/50 !text-gray-800 !font-medium !rounded-xl !pl-4 !pr-10 !py-2.5 !text-[14px] focus:!ring-4 focus:!ring-blue-500/20 focus:!border-white/80 !outline-none !transition-all !cursor-pointer !block !shadow-inner"
        >
          <option value="">Select</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-500">
          <ChevronDown size={16} />
        </div>
      </div>
      {errors[id] && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors[id]?.message as string}</p>}
    </div>
  );

  return (
    <div className="!space-y-8">
      
      <div>
        <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-4 !pb-2 !border-b !border-gray-200/50">Basic Specs</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-5">
          <InputField id="bedrooms" label="Bedrooms" placeholder="E.g. 3" />
          <InputField id="bathrooms" label="Bathrooms" placeholder="E.g. 2" />
          <InputField id="balconies" label="Balconies" placeholder="E.g. 1" />
          <InputField id="parkingSpaces" label="Parking Spaces" placeholder="E.g. 2" />
          <InputField id="floorNumber" label="Floor Number" placeholder="E.g. 4" />
          <InputField id="totalFloors" label="Total Floors" placeholder="E.g. 12" />
        </div>
      </div>

      <div>
        <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-4 !pb-2 !border-b !border-gray-200/50">Area Details</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-5">
          <SelectField id="areaUnit" label="Area Unit" options={['Sq Ft', 'Sq M', 'Acres', 'Cents']} />
          <InputField id="carpetArea" label="Carpet Area" placeholder="E.g. 1200" />
          <InputField id="builtUpArea" label="Built Up Area" placeholder="E.g. 1400" />
          <InputField id="superBuiltUpArea" label="Super Built Up Area" placeholder="E.g. 1500" />
          <InputField id="plotArea" label="Plot Area" placeholder="E.g. 2000" />
        </div>
      </div>

      <div>
        <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-4 !pb-2 !border-b !border-gray-200/50">Property Features</h3>
        <div className="!grid !grid-cols-2 md:!grid-cols-4 !gap-5">
          <SelectField id="propertyFacing" label="Property Facing" options={['East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West']} />
          <SelectField id="propertyAge" label="Property Age" options={['New', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years']} />
          <SelectField id="furnishing" label="Furnishing" options={['Furnished', 'Semi Furnished', 'Unfurnished']} />
          <SelectField id="possessionStatus" label="Possession Status" options={['Ready To Move', 'Under Construction', 'Immediate', 'Future Date']} />
          <InputField id="waterSupply" label="Water Supply" type="text" placeholder="E.g. 24 Hours, BMC" />
          <InputField id="powerBackup" label="Power Backup" type="text" placeholder="E.g. Full, Partial" />
          <InputField id="roadWidth" label="Road Width (ft)" placeholder="E.g. 40" />
          <InputField id="openSides" label="Open Sides" placeholder="E.g. 2" />
        </div>
      </div>

    </div>
  );
}
