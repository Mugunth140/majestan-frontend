import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step8SEO() {
 const { register, formState: { errors } } = useFormContext();

 return (
 <div className="!space-y-6">
 <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-5/50">
 Search Engine Optimization (Admin Only)
 </h3>
 
 <div className="!grid !grid-cols-1 !gap-6">
 <div className="!space-y-1.5">
 <label htmlFor="seoSlug" className="!text-[14px] !font-semibold !text-gray-800">SEO URL Slug</label>
 <input 
 id="seoSlug"
 {...register('seoSlug')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="luxury-3bhk-villa-mumbai" 
 />
 {errors.seoSlug && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.seoSlug.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="metaTitle" className="!text-[14px] !font-semibold !text-gray-800">Meta Title</label>
 <input 
 id="metaTitle"
 {...register('metaTitle')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="Buy Luxury 3BHK Villa in Mumbai | Real Estate" 
 />
 {errors.metaTitle && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.metaTitle.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="metaDescription" className="!text-[14px] !font-semibold !text-gray-800">Meta Description</label>
 <textarea 
 id="metaDescription"
 {...register('metaDescription')} 
 rows={3}
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="Find the best luxury villas in Mumbai. Excellent amenities, sea view, and premium location." 
 />
 {errors.metaDescription && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.metaDescription.message as string}</p>}
 </div>

 <div className="!space-y-1.5">
 <label htmlFor="metaKeywords" className="!text-[14px] !font-semibold !text-gray-800">Meta Keywords</label>
 <input 
 id="metaKeywords"
 {...register('metaKeywords')} 
 className="!w-full !bg-white !border !border-gray-200 !rounded-xl !px-4 !py-3 !text-[14px] !font-medium !text-gray-800 focus:!ring-2 focus:!ring-blue-500/20 focus:!border-blue-500 !shadow-sm !outline-none !transition-all" 
 placeholder="villa, mumbai, luxury real estate, 3bhk" 
 />
 {errors.metaKeywords && <p className="!text-rose-500 !text-xs !font-medium !mt-1">{errors.metaKeywords.message as string}</p>}
 </div>
 </div>
 </div>
 );
}
