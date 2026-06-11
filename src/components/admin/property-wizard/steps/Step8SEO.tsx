import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingTextarea } from '../ui/FloatingInput';

export default function Step8SEO() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 !gap-x-6 !gap-y-8">
        
        <FloatingInput 
          id="seoSlug"
          label="SEO URL Slug"
          registerProps={register('seoSlug')}
          error={errors.seoSlug?.message as string}
        />

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
