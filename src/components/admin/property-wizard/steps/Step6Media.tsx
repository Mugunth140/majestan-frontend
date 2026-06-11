import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ImagePlus, X, UploadCloud } from 'lucide-react';

export default function Step6Media() {
  const { watch, setValue } = useFormContext();
  
  const rawImages: any[] = watch('images') || [];
  // Ensure we only render valid File objects (safeguard against corrupted localStorage)
  const images: File[] = rawImages.filter(img => img instanceof File || img instanceof Blob);

  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    setValue('images', [...images, ...newFiles], { shouldValidate: true, shouldDirty: true });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setValue('images', newImages, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="!space-y-8">
      
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`!w-full !rounded-[2rem] !border-2 !border-dashed !flex !flex-col !items-center !justify-center !p-12 !text-center !transition-all !duration-200 ${
          isDragging 
            ? '!border-blue-500 !bg-blue-50 dark:!bg-blue-900/20' 
            : '!border-gray-200 dark:!border-[#262730] !bg-gray-50/50 dark:!bg-[#0f1015] hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] hover:!border-gray-300 dark:hover:!border-gray-600'
        }`}
      >
        <div className="!w-16 !h-16 !rounded-full !bg-white dark:!bg-[#171821] !shadow-sm !border !border-gray-100 dark:!border-[#262730] !flex !items-center !justify-center !mb-5">
          <UploadCloud className={`!w-8 !h-8 ${isDragging ? '!text-blue-500' : '!text-gray-400'}`} />
        </div>
        <h3 className="!text-base !font-semibold !text-gray-900 dark:!text-white !mb-2">
          Drag and drop your images here
        </h3>
        <p className="!text-sm !text-gray-500 dark:!text-gray-400 !mb-6">
          Support for JPG, PNG, WEBP. Max 5MB per file.
        </p>
        
        <label className="!inline-flex !items-center !justify-center !gap-2 !px-6 !py-2.5 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] hover:!border-gray-300 dark:hover:!border-gray-600 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] !text-gray-700 dark:!text-gray-300 !text-sm !font-medium !rounded-xl !shadow-sm !transition-all active:!scale-[0.98] !cursor-pointer">
          <ImagePlus size={18} />
          Browse Files
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="!hidden" 
            onChange={handleFileInput} 
          />
        </label>
      </div>

      {images.length > 0 && (
        <div>
          <h4 className="!text-[14px] !font-bold !text-gray-800 dark:!text-white !mb-4">Selected Images ({images.length})</h4>
          <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 !gap-4">
            {images.map((img, i) => (
              <div key={`${img.name}-${i}`} className="!relative !aspect-square !rounded-2xl !overflow-hidden !border !border-gray-200 dark:!border-[#262730] !shadow-sm !group">
                <img 
                  src={URL.createObjectURL(img)} 
                  alt="Preview" 
                  className="!w-full !h-full !object-cover !transition-transform !duration-300 group-hover:!scale-110" 
                />
                <div className="!absolute !inset-0 !bg-black/40 !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200" />
                <button 
                  type="button" 
                  onClick={() => removeImage(i)} 
                  className="!absolute !top-2 !right-2 !p-1.5 !bg-white/90 dark:!bg-[#171821]/90 !backdrop-blur-sm !text-gray-600 dark:!text-gray-300 hover:!text-rose-600 dark:hover:!text-rose-500 !rounded-lg !opacity-0 group-hover:!opacity-100 !transition-all hover:!scale-110"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
                {i === 0 && (
                  <div className="!absolute !bottom-2 !left-2 !px-2 !py-1 !bg-emerald-500 !text-white !text-[10px] !font-bold !rounded-md !uppercase !tracking-wide !shadow-sm">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
