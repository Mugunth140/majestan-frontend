import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

export default function Step1BasicInfo() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6!">
      <div className="grid! grid-cols-1! md:grid-cols-2! gap-6!">
        <div className="space-y-2! md:col-span-2!">
          <label htmlFor="title" className="text-[14px]! font-semibold! text-gray-800!">Property Title</label>
          <input 
            id="title"
            {...register('title')} 
            className="w-full! bg-white/30! backdrop-blur-md! border! border-white/50! rounded-xl! px-4! py-3! text-[14px]! font-medium! text-gray-800! focus:ring-4! focus:ring-blue-500/20! focus:border-white/80! shadow-inner! outline-none! transition-all!" 
            placeholder="E.g. Luxury 3BHK Villa" 
          />
          {errors.title && <p className="text-rose-500! text-xs! font-medium! mt-1!">{errors.title.message as string}</p>}
        </div>

        <div className="space-y-2!">
          <label htmlFor="propertyType" className="text-[14px]! font-semibold! text-gray-800!">Property Type</label>
          <div className="relative!">
            <select 
              id="propertyType"
              {...register('propertyType')} 
              className="w-full! appearance-none! bg-white/30! backdrop-blur-md! border! border-white/50! text-gray-800! font-medium! rounded-xl! pl-4! pr-10! py-3! text-[14px]! focus:ring-4! focus:ring-blue-500/20! focus:border-white/80! outline-none! transition-all! cursor-pointer! block! shadow-inner!"
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial Space</option>
              <option value="coworking">Coworking</option>
              <option value="farmland">Farmland</option>
              <option value="industrial">Industrial Space</option>
              <option value="independent_portion">Independent House</option>
            </select>
            <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-gray-500!">
              <ChevronDown size={18} />
            </div>
          </div>
          {errors.propertyType && <p className="text-rose-500! text-xs! font-medium! mt-1!">{errors.propertyType.message as string}</p>}
        </div>

        <div className="space-y-2!">
          <label htmlFor="listingType" className="text-[14px]! font-semibold! text-gray-800!">Listing Type</label>
          <div className="relative!">
            <select 
              id="listingType"
              {...register('listingType')} 
              className="w-full! appearance-none! bg-white/30! backdrop-blur-md! border! border-white/50! text-gray-800! font-medium! rounded-xl! pl-4! pr-10! py-3! text-[14px]! focus:ring-4! focus:ring-blue-500/20! focus:border-white/80! outline-none! transition-all! cursor-pointer! block! shadow-inner!"
            >
              <option value="Sell">Sell</option>
              <option value="Rent">Rent</option>
            </select>
            <div className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none! text-gray-500!">
              <ChevronDown size={18} />
            </div>
          </div>
          {errors.listingType && <p className="text-rose-500! text-xs! font-medium! mt-1!">{errors.listingType.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2!">
        <label htmlFor="description" className="text-[14px]! font-semibold! text-gray-800!">Description</label>
        <textarea 
          id="description"
          {...register('description')} 
          rows={5} 
          className="w-full! bg-white/30! backdrop-blur-md! border! border-white/50! rounded-xl! px-4! py-3! text-[14px]! font-medium! text-gray-800! focus:ring-4! focus:ring-blue-500/20! focus:border-white/80! shadow-inner! outline-none! transition-all!" 
          placeholder="Detailed description of the property..."
        ></textarea>
        {errors.description && <p className="text-rose-500! text-xs! font-medium! mt-1!">{errors.description.message as string}</p>}
      </div>
    </div>
  );
}
