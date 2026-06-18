import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';
import { parseIndianCurrency, numberToIndianWords } from '@/lib/utils/currency.util';

const PriceIndicator = ({ value }: { value: string }) => {
  if (!value) return null;
  const parsed = parseIndianCurrency(value);
  if (isNaN(parsed) || parsed === 0) return null;
  return (
    <div className="!text-[12px] !text-emerald-600 dark:!text-emerald-400 !mt-[-4px] !mb-2 !font-medium !pl-2 !tracking-tight">
      ₹ {parsed.toLocaleString('en-IN')} <span className="!text-gray-500 dark:!text-gray-400 !font-normal">({numberToIndianWords(parsed)})</span>
    </div>
  );
};

export default function Step2Pricing({ isAdmin }: { isAdmin?: boolean }) {
  const { register, formState: { errors }, watch } = useFormContext();
  const listingType = watch('listingType');
  const brokerageType = watch('brokerageType');

  return (
    <div className="!space-y-8">
      <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
        
        <div>
          <FloatingInput 
            id="price"
            type="text"
            label={listingType === 'Rent' ? 'Monthly Rent (₹)' : 'Total Price (e.g. 1.5 Cr, 45 Lk)'}
            registerProps={register('price')}
            error={errors.price?.message as string}
          />
          <PriceIndicator value={watch('price')} />
        </div>

        <div className="!flex !items-center !h-full !pt-2">
          <label className="!inline-flex !items-center !cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register('negotiable')} />
            <div className="!relative !w-11 !h-6 !bg-gray-200 peer-focus:!outline-none !rounded-full !peer dark:!bg-[#262730] peer-checked:after:!translate-x-full rtl:peer-checked:after:!-translate-x-full peer-checked:after:!border-white after:!content-[''] after:!absolute after:!top-[2px] after:!start-[2px] after:!bg-white after:!border-gray-300 after:!border after:!rounded-full after:!h-5 after:!w-5 after:!transition-all dark:!border-gray-600 peer-checked:!bg-[#27427f]"></div>
            <span className="!ms-3 !text-sm !font-medium !text-gray-700 dark:!text-gray-300">Price is Negotiable</span>
          </label>
        </div>

        <div>
          <FloatingInput 
            id="maintenanceCharges"
            type="text"
            label="Maintenance Charges (e.g. 5 K)"
            registerProps={register('maintenanceCharges')}
            error={errors.maintenanceCharges?.message as string}
          />
          <PriceIndicator value={watch('maintenanceCharges')} />
        </div>

        <div>
          <FloatingInput 
            id="securityDeposit-or-booking"
            type="text"
            label={listingType === 'Rent' ? 'Security Deposit (e.g. 1 Lk)' : 'Registration Charges (e.g. 5 Lk)'}
            registerProps={register(listingType === 'Rent' ? 'securityDeposit' : 'bookingAmount')}
            error={errors.securityDeposit?.message as string || errors.bookingAmount?.message as string}
          />
          <PriceIndicator value={watch(listingType === 'Rent' ? 'securityDeposit' : 'bookingAmount')} />
        </div>

      </div>

      {isAdmin && (
        <div className="!pt-6 !border-t !border-gray-100 dark:!border-[#262730]">
          <h3 className="!text-sm !font-bold !text-gray-900 dark:!text-white !mb-6 !uppercase !tracking-wider">Brokerage Details (Admin)</h3>
          <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-6 !gap-y-8">
            <FloatingSelect 
              id="brokerageType"
              label="Brokerage Type"
              options={[
                { value: 'no_brokerage', label: 'No Brokerage' },
                { value: listingType === 'Rent' ? 'days' : 'percentage', label: listingType === 'Rent' ? 'Days of Rent' : 'Percentage (%)' }
              ]}
              registerProps={register('brokerageType')}
              error={errors.brokerageType?.message as string}
            />

            {brokerageType && brokerageType !== 'no_brokerage' && (
              <FloatingInput 
                id="brokerageValue"
                type="text"
                label={brokerageType === 'days' ? 'Number of Days (e.g. 15)' : 'Percentage (e.g. 1.5)'}
                registerProps={register('brokerageValue')}
                error={errors.brokerageValue?.message as string}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
