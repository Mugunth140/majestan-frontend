import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingTextarea } from '../ui/FloatingInput';

export default function Step8SEO() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 !gap-x-6 !gap-y-8">
        
        <div>
          <FloatingInput 
            id="seoSlug"
            label="SEO URL Slug"
            registerProps={register('seoSlug')}
            error={errors.seoSlug?.message as string}
          />
          <p className="!text-[11px] !text-amber-600 dark:!text-amber-500 !mt-2 !font-medium !flex !items-center !gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Do not include property IDs (e.g. -ap004) at the end. The system appends them automatically.
          </p>
        </div>

        <FloatingInput 
          id="metaTitle"
          label="Meta Title"
          registerProps={register('metaTitle')}
          error={errors.metaTitle?.message as string}
        />

        <FloatingTextarea 
          id="metaDescription"
          label="Meta Description"
          rows={3}
          registerProps={register('metaDescription')}
          error={errors.metaDescription?.message as string}
        />

        <FloatingInput 
          id="metaKeywords"
          label="Meta Keywords"
          registerProps={register('metaKeywords')}
          error={errors.metaKeywords?.message as string}
        />

      </div>
    </div>
  );
}
