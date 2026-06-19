import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, UploadCloud, FileImage } from 'lucide-react';
import { FloatingInput } from '../ui/FloatingInput';
import { API_BASE_URL } from '@/lib/api';
import { useUserAuthStore } from '@/store/userAuthStore';
import { toast } from '@/components/ui/toast-store';

const FLOOR_PLAN_LABELS: Record<string, string> = {
  apartment: 'Upload Floor Plan',
  villa: 'Upload Floor Plan',
  individual_portion: 'Upload Floor Plan',
  commercial: 'Upload Layout Plan',
  coworking: 'Upload Seating/Layout Plan',
  industrial: 'Upload Warehouse Layout',
  plot: 'Upload Site Layout / Plot Sketch',
  farmland: 'Upload Survey Map / Land Layout'
};

export default function Step8FloorPlans() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "units"
  });

  const token = useUserAuthStore(s => s.token);

  const propertyType = watch('propertyType') || 'apartment';
  const headerLabel = FLOOR_PLAN_LABELS[propertyType] || 'Upload Floor Plan';

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const presignedRes = await fetch(
        `${API_BASE_URL}/properties/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!presignedRes.ok) throw new Error("Failed to get presigned URL");
      
      const { data } = await presignedRes.json();
      
      const uploadRes = await fetch(data.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file");

      setValue(`units.${index}.floorPlanImageUrl`, data.key, { shouldValidate: true, shouldDirty: true });
      setValue(`units.${index}.floorPlanImageKey`, data.key, { shouldDirty: true });
    } catch (err) {
      console.error(err);
          toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="!space-y-8">
      <div>
        <h3 className="!text-[15px] !font-bold !text-gray-900 dark:!text-white !uppercase !tracking-wider !mb-2">{headerLabel}</h3>
        <p className="!text-sm !text-gray-500 dark:!text-gray-400">Add multiple units to automatically display price and area ranges on your property listing.</p>
      </div>

      <div className="!space-y-6">
        {fields.map((field, index) => {
          const fileUrl = watch(`units.${index}.floorPlanImageUrl`);
          
          return (
            <div key={field.id} className="!p-6 !bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-2xl !relative group">
              <button 
                type="button" 
                onClick={() => remove(index)}
                className="!absolute !top-4 !right-4 !p-2 !text-gray-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10 !rounded-xl !transition-all"
              >
                <Trash2 size={18} />
              </button>

              <h4 className="!text-sm !font-bold !text-gray-800 dark:!text-white !mb-5">Unit #{index + 1}</h4>
              
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                <FloatingInput 
                  id={`units.${index}.title`}
                  label="Plan Title (e.g. 'Ground Floor Layout')"
                  registerProps={register(`units.${index}.title` as const)}
                />

                <FloatingInput 
                  id={`units.${index}.price`}
                  label="Price (e.g. 1.2 Cr or 12000000)"
                  registerProps={register(`units.${index}.price` as const)}
                />

                <FloatingInput 
                  id={`units.${index}.sizeSqft`}
                  label="Area (Sq.Ft)"
                  type="number"
                  registerProps={register(`units.${index}.sizeSqft` as const, { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                />
              </div>

              <div className="!mt-6">
                <label className="!block !text-[13px] !font-bold !text-gray-700 dark:!text-gray-300 !uppercase !tracking-wider !mb-2">Image</label>
                {fileUrl ? (
                  <div className="!flex !items-center !gap-4 !p-4 !bg-white dark:!bg-[#0f1015] !border !border-gray-200 dark:!border-[#262730] !rounded-xl">
                    <div className="!w-12 !h-12 !bg-blue-50 dark:!bg-blue-500/10 !text-blue-600 !rounded-lg !flex !items-center !justify-center">
                      <FileImage size={24} />
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <p className="!text-sm !font-medium !text-gray-900 dark:!text-white !truncate">{fileUrl}</p>
                      <p className="!text-xs !text-green-600">Uploaded successfully</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setValue(`units.${index}.floorPlanImageUrl`, '')}
                      className="!text-sm !text-red-500 !font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="!relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(index, e)}
                      className="!absolute !inset-0 !w-full !h-full !opacity-0 !cursor-pointer !z-10"
                      disabled={uploadingIndex === index}
                    />
                    <div className={`!flex !flex-col !items-center !justify-center !p-8 !border-2 !border-dashed !rounded-xl !transition-all ${uploadingIndex === index ? '!border-blue-500 !bg-blue-50 dark:!bg-blue-500/5' : '!border-gray-300 dark:!border-gray-700 !bg-white dark:!bg-[#0f1015]'}`}>
                      {uploadingIndex === index ? (
                        <div className="!w-6 !h-6 !border-2 !border-blue-600 !border-t-transparent !rounded-full !animate-spin !mb-2" />
                      ) : (
                        <UploadCloud className="!w-8 !h-8 !text-gray-400 !mb-2" />
                      )}
                      <p className="!text-sm !font-medium !text-gray-600 dark:!text-gray-300">
                        {uploadingIndex === index ? 'Uploading...' : 'Click or drag image to upload'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button 
        type="button"
        onClick={() => append({ unitType: '', title: '', price: '', sizeSqft: 0 })}
        className="!flex !items-center !gap-2 !px-6 !py-3 !border-2 !border-dashed !border-gray-300 dark:!border-gray-700 hover:!border-blue-500 dark:hover:!border-blue-500 !text-gray-600 dark:!text-gray-300 hover:!text-blue-600 dark:hover:!text-blue-500 !rounded-2xl !w-full !justify-center !transition-all !font-bold !text-sm"
      >
        <Plus size={18} />
        Add {headerLabel}
      </button>

    </div>
  );
}
