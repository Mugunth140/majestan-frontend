import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ImagePlus, X, UploadCloud, GripVertical, Star } from 'lucide-react';
import { toast } from '@/components/ui/toast-store';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function Step6Media() {
  const { watch, setValue } = useFormContext();

  const rawImages: any[] = watch('images') || [];
  const existingImageUrls: { url: string, key: string }[] = watch('existingImageUrls') || [];
  // Only real File objects (new uploads)
  const images: File[] = rawImages.filter(img => img instanceof File || img instanceof Blob) as File[];

  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingOver, setDraggingOver] = useState<number | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // ── Manage object URLs to prevent memory leaks ────────────
  useEffect(() => {
    const urls = images.map(img => URL.createObjectURL(img));
    setPreviewUrls(urls);
    return () => {
      urls.forEach(u => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, images.map(i => i.name + i.size).join(',')]);

  // ── File input ────────────────────────────────────────────
  const handleFiles = (files: FileList | File[]) => {
    const rejected: string[] = [];
    const validFiles = Array.from(files).filter(f => {
      if (!ALLOWED_MIME_TYPES.includes(f.type)) {
        rejected.push(`${f.name}: unsupported format (JPG, PNG, WEBP only)`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        rejected.push(`${f.name}: exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        return false;
      }
      return true;
    });

    if (rejected.length > 0) {
      toast.error(`${rejected.length} file(s) rejected:\n${rejected.join('\n')}`);
    }

    const slots = MAX_IMAGES - (existingImageUrls.length + images.length);
    if (slots <= 0) return;
    const allowed = validFiles.slice(0, slots);
    setValue('images', [...images, ...allowed], { shouldValidate: true, shouldDirty: true });
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  // ── Remove ────────────────────────────────────────────────
  const removeNewImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    setValue('images', next, { shouldValidate: true, shouldDirty: true });
  };

  const removeExistingImage = (index: number) => {
    const next = [...existingImageUrls];
    next.splice(index, 1);
    setValue('existingImageUrls', next, { shouldDirty: true });
  };

  // ── Drag-to-reorder (new images only) ────────────────────
  const onCardDragStart = (index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
  };
  const onCardDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDraggingOver(index);
  };
  const onCardDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      setDraggingIndex(null);
      setDraggingOver(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    setValue('images', reordered, { shouldValidate: true, shouldDirty: true });
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);
    setDraggingOver(null);
  };

  const totalCount = existingImageUrls.length + images.length;
  const MAX_IMAGES = 10;
  const remaining = MAX_IMAGES - totalCount;
  const atLimit = totalCount >= MAX_IMAGES;

  return (
    <div className="!space-y-8">

      {/* Limit counter */}
      <div className="!flex !items-center !justify-between">
        <p className="!text-sm !text-gray-500 dark:!text-gray-400">
          <span className={`!font-bold ${atLimit ? '!text-red-500' : '!text-gray-900 dark:!text-white'}`}>{totalCount}</span>
          <span> / {MAX_IMAGES} images</span>
        </p>
        {atLimit && (
          <span className="!text-xs !font-semibold !text-red-500 !bg-red-50 dark:!bg-red-500/10 !px-3 !py-1 !rounded-full">
            Maximum {MAX_IMAGES} images reached
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={atLimit ? undefined : onDragOver}
        onDragLeave={atLimit ? undefined : onDragLeave}
        onDrop={atLimit ? undefined : onDrop}
        className={`!w-full !rounded-[2rem] !border-2 !border-dashed !flex !flex-col !items-center !justify-center !p-12 !text-center !transition-all !duration-200 ${
          atLimit
            ? '!border-gray-100 dark:!border-[#1e1f2a] !bg-gray-50/30 dark:!bg-[#0f1015]/50 !opacity-60 !cursor-not-allowed'
            : isDragging
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
          {atLimit
            ? `Limit reached. Remove an image to upload more.`
            : `Support for JPG, PNG, WEBP. Max 5MB per file. ${remaining} slot${remaining === 1 ? '' : 's'} remaining. First image becomes the cover photo.`}
        </p>
        <label className={`!inline-flex !items-center !justify-center !gap-2 !px-6 !py-2.5 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] hover:!border-gray-300 dark:hover:!border-gray-600 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] !text-gray-700 dark:!text-gray-300 !text-sm !font-medium !rounded-xl !shadow-sm !transition-all active:!scale-[0.98] ${atLimit ? '!opacity-40 !cursor-not-allowed !pointer-events-none' : '!cursor-pointer'}`}>
          <ImagePlus size={18} />
          Browse Files
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="!hidden"
            onChange={handleFileInput}
            disabled={atLimit}
          />
        </label>
      </div>

      {/* Existing images (edit mode) */}
      {existingImageUrls.length > 0 && (
        <div>
          <h4 className="!text-[14px] !font-bold !text-gray-800 dark:!text-white !mb-3">
            Saved Images ({existingImageUrls.length})
            <span className="!ml-2 !text-[12px] !font-normal !text-gray-400">— click × to remove</span>
          </h4>
          <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 !gap-4">
            {existingImageUrls.map((imgObj, i) => (
              <div
                key={`existing-${i}`}
                className="!relative !aspect-square !rounded-2xl !overflow-hidden !border !border-gray-200 dark:!border-[#262730] !shadow-sm group"
              >
                <img
                  src={imgObj.url}
                  alt={`Saved image ${i + 1}`}
                  className="!w-full !h-full !object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                />
                <div className="!absolute !inset-0 !bg-black/40 !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200" />
                {i === 0 && (
                  <div className="!absolute !bottom-2 !left-2 !flex !items-center !gap-1 !px-2 !py-1 !bg-emerald-500 !text-white !text-[10px] !font-bold !rounded-md !uppercase !tracking-wide !shadow-sm">
                    <Star size={9} fill="white" /> Cover
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="!absolute !top-2 !right-2 !p-1.5 !bg-white/90 dark:!bg-[#171821]/90 !backdrop-blur-sm !text-gray-600 dark:!text-gray-300 hover:!text-rose-600 dark:hover:!text-rose-500 !rounded-lg !opacity-0 group-hover:!opacity-100 !transition-all hover:!scale-110"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images (with drag-to-reorder) */}
      {images.length > 0 && (
        <div>
          <h4 className="!text-[14px] !font-bold !text-gray-800 dark:!text-white !mb-1">
            New Images ({images.length})
          </h4>
          <p className="!text-[12px] !text-gray-400 dark:!text-gray-500 !mb-3 !flex !items-center !gap-1">
            <GripVertical size={13} /> Drag cards to reorder. First card = cover photo.
          </p>
          <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 !gap-4">
            {images.map((img, i) => (
              <div
                key={`new-${img.name}-${i}`}
                draggable
                onDragStart={() => onCardDragStart(i)}
                onDragEnter={() => onCardDragEnter(i)}
                onDragEnd={onCardDragEnd}
                onDragOver={e => e.preventDefault()}
                className={`!relative !aspect-square !rounded-2xl !overflow-hidden !border-2 !shadow-sm group !cursor-grab active:!cursor-grabbing !transition-all !duration-150 ${
                  draggingIndex === i
                    ? '!opacity-40 !scale-95 !border-blue-400'
                    : draggingOver === i
                    ? '!border-blue-500 !scale-105 !shadow-lg'
                    : '!border-gray-200 dark:!border-[#262730]'
                }`}
              >
                <img
                  src={previewUrls[i] ?? ''}
                  alt="Preview"
                  className="!w-full !h-full !object-cover !pointer-events-none !transition-transform !duration-300 group-hover:!scale-110"
                />
                <div className="!absolute !inset-0 !bg-black/40 !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-200" />

                {/* Drag handle */}
                <div className="!absolute !top-2 !left-2 !p-1 !bg-black/40 !text-white !rounded !opacity-0 group-hover:!opacity-100 !transition-all">
                  <GripVertical size={14} />
                </div>

                {/* Cover badge */}
                {i === 0 && existingImageUrls.length === 0 && (
                  <div className="!absolute !bottom-2 !left-2 !flex !items-center !gap-1 !px-2 !py-1 !bg-emerald-500 !text-white !text-[10px] !font-bold !rounded-md !uppercase !tracking-wide !shadow-sm">
                    <Star size={9} fill="white" /> Cover
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="!absolute !top-2 !right-2 !p-1.5 !bg-white/90 dark:!bg-[#171821]/90 !backdrop-blur-sm !text-gray-600 dark:!text-gray-300 hover:!text-rose-600 dark:hover:!text-rose-500 !rounded-lg !opacity-0 group-hover:!opacity-100 !transition-all hover:!scale-110"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCount === 0 && (
        <p className="!text-center !text-[13px] !text-gray-400 dark:!text-gray-500">No images selected yet.</p>
      )}
    </div>
  );
}
