import React, { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ImagePlus, X, UploadCloud } from 'lucide-react';

export default function Step6Media() {
 const { watch, setValue } = useFormContext();
 const images: File[] = watch('images') || [];
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
 
 {/* Drag & Drop Zone */}
 <div 
 onDragOver={onDragOver}
 onDragLeave={onDragLeave}
 onDrop={onDrop}
 className={`!w-full !rounded-3xl !border-2 !border-dashed !flex !flex-col !items-center !justify-center !p-10 !text-center !transition-all !duration-200 ${
 isDragging 
 ? '!border-blue-500 !bg-blue-50 ' 
 : '!border-gray-200 !bg-white hover:!bg-gray-50'
 }`}
 >
 <div className="!w-16 !h-16 !rounded-full !bg-white !shadow-sm !flex !items-center !justify-center !mb-4">
 <UploadCloud className={`!w-8 !h-8 ${isDragging ? '!text-blue-500' : '!text-gray-400'}`} />
 </div>
 <h3 className="!text-[16px] !font-bold !text-gray-900 !mb-2">
 Drag and drop your images here
 </h3>
 <p className="!text-[13px] !font-medium !text-gray-500 !mb-6">
 Support for JPG, PNG, WEBP. Max 5MB per file.
 </p>
 
 <label className="!inline-flex !items-center !gap-2 !px-6 !py-2.5 !bg-white !border !border-gray-200 hover:!border-gray-300 hover:!bg-gray-50 !rounded-xl !text-[14px] !font-semibold !text-gray-700 !shadow-sm !cursor-pointer !transition-all">
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

 {/* Preview Grid */}
 {images.length > 0 && (
 <div>
 <h4 className="!text-[14px] !font-bold !text-gray-800 !mb-4">Selected Images ({images.length})</h4>
 <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 !gap-4">
 {images.map((img, i) => (
 <div key={`${img.name}-${i}`} className="!relative !aspect-square !rounded-2xl !overflow-hidden !border !border-gray-200 !shadow-sm !group">
 <img 
 src={URL.createObjectURL(img)} 
 alt="Preview" 
 className="!w-full !h-full !object-cover !transition-transform !duration-300 group-hover:!scale-110" 
 />
 <div className="!absolute !inset-0 !bg-black/40 !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200" />
 <button 
 type="button" 
 onClick={() => removeImage(i)} 
 className="!absolute !top-2 !right-2 !p-1.5 !bg-white !text-gray-600 hover:!text-rose-600 !rounded-lg !opacity-0 group-hover:!opacity-100 !transition-all hover:!scale-110"
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
