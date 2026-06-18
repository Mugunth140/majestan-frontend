import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { FloatingInput } from '../ui/FloatingInput';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'floor-plan', label: 'Floor Plan' },
  { id: 'locality', label: 'Locality' },
  { id: 'photos', label: 'Photos' },
];

export default function Step10Faqs() {
  const [activeTab, setActiveTab] = useState('overview');
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'faqs' });

  return (
    <div className="!space-y-8">
      <div>
        <h3 className="!text-[15px] !font-bold !text-gray-900 dark:!text-white !uppercase !tracking-wider !mb-2">
          Frequently Asked Questions
        </h3>
        <p className="!text-sm !text-gray-500 dark:!text-gray-400">
          Add specific FAQs for each page section.
        </p>
      </div>

      {/* Tabs */}
      <div className="!flex !items-center !gap-2 !overflow-x-auto !pb-2 !scrollbar-hide">
        {SECTIONS.map(s => {
          const count = fields.filter((f: any) => f.section === s.id).length;
          const isActive = activeTab === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveTab(s.id)}
              className={`!flex !items-center !gap-2 !px-5 !py-2.5 !rounded-full !text-sm !font-bold !transition-all !whitespace-nowrap ${
                isActive 
                  ? '!bg-[#27427f] !text-white !shadow-sm' 
                  : '!bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !text-gray-600 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-[#1c1d27]'
              }`}
            >
              {s.label}
              {count > 0 && (
                <span className={`!flex !items-center !justify-center !w-5 !h-5 !rounded-full !text-[11px] ${
                  isActive ? '!bg-white/20' : '!bg-[#27427f]/10 !text-[#27427f]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="!space-y-5">
        {fields.map((field: any, index) => {
          if (field.section !== activeTab) return null;
          
          return (
            <div
              key={field.id}
              className="!p-6 !bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-2xl !relative"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="!absolute !top-4 !right-4 !p-2 !text-gray-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10 !rounded-xl !transition-all"
              >
                <Trash2 size={17} />
              </button>

              <div className="!flex !items-center !gap-2 !mb-5">
                <div className="!w-7 !h-7 !rounded-full !bg-[#27427f]/10 !flex !items-center !justify-center">
                  <HelpCircle size={14} className="!text-[#27427f]" />
                </div>
                <span className="!text-sm !font-bold !text-gray-800 dark:!text-white">Question</span>
              </div>

              {/* Hidden section input */}
              <input type="hidden" {...register(`faqs.${index}.section` as const)} value={activeTab} />

              <div className="!space-y-4">
                <FloatingInput
                  id={`faqs.${index}.question`}
                  label="Question"
                  type="text"
                  registerProps={register(`faqs.${index}.question` as const)}
                  error={(errors.faqs as any)?.[index]?.question?.message}
                />
                <div>
                  <label className="!block !text-[12px] !font-bold !text-gray-500 dark:!text-gray-400 !uppercase !tracking-wider !mb-2 !pl-1">
                    Answer
                  </label>
                  <textarea
                    {...register(`faqs.${index}.answer` as const)}
                    rows={3}
                    placeholder="Type the answer here..."
                    className="!w-full !px-4 !py-3 !rounded-xl !border !border-gray-200 dark:!border-[#262730] !bg-white dark:!bg-[#0f1015] !text-gray-900 dark:!text-white !text-sm !outline-none focus:!border-[#27427f] !resize-none !transition-colors"
                  />
                  {(errors.faqs as any)?.[index]?.answer?.message && (
                    <p className="!text-xs !text-red-500 !mt-1 !pl-1">
                      {(errors.faqs as any)[index].answer.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {fields.filter((f: any) => f.section === activeTab).length === 0 && (
        <div className="!text-center !py-10 !text-gray-400 dark:!text-gray-600">
          <HelpCircle size={36} className="!mx-auto !mb-3 !opacity-30" />
          <p className="!text-sm">No FAQs added for the {SECTIONS.find(s => s.id === activeTab)?.label} section yet.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => append({ question: '', answer: '', section: activeTab })}
        className="!flex !items-center !gap-2 !px-6 !py-3 !border-2 !border-dashed !border-gray-300 dark:!border-gray-700 hover:!border-[#27427f] dark:hover:!border-[#27427f] !text-gray-600 dark:!text-gray-300 hover:!text-[#27427f] dark:hover:!text-[#27427f] !rounded-2xl !w-full !justify-center !transition-all !font-bold !text-sm"
      >
        <Plus size={18} />
        Add FAQ to {SECTIONS.find(s => s.id === activeTab)?.label}
      </button>
    </div>
  );
}
