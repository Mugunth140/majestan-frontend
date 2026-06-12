import React from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registerProps?: any;
}

export function FloatingInput({ label, error, registerProps, className = "", ...props }: FloatingInputProps) {
  return (
    <div className="!relative !w-full !mb-2">
      <input
        {...registerProps}
        {...props}
        placeholder=" "
        className={`!block !px-4 !pb-2.5 !pt-5 !w-full !text-[14px] !text-gray-900 !bg-white dark:!bg-[#171821] !rounded-xl !border ${error ? '!border-rose-500 focus:!border-rose-500' : '!border-gray-200 dark:!border-[#262730] focus:!border-blue-600 dark:focus:!border-blue-500'} !appearance-none dark:!text-white focus:!outline-none focus:!ring-0 peer !transition-all ${className}`}
      />
      <label htmlFor={props.id || registerProps?.name}
        className={`!absolute !text-[13px] ${error ? '!text-rose-500' : '!text-gray-500 dark:!text-gray-400 peer-focus:!text-blue-600 peer-focus:dark:!text-blue-500'} !duration-300 !transform !-translate-y-4 !scale-75 !top-4 !z-10 !origin-[0] !bg-white dark:!bg-[#171821] !px-2 peer-focus:!px-2 peer-placeholder-shown:!scale-100 peer-placeholder-shown:!-translate-y-1/2 peer-placeholder-shown:!top-1/2 peer-focus:!top-4 peer-focus:!scale-75 peer-focus:!-translate-y-4 start-3 !pointer-events-none`}
      >
        {label}
      </label>
      {error && <p className="!absolute !-bottom-5 !left-1 !text-rose-500 !text-[11px] !font-medium">{error}</p>}
    </div>
  );
}

export function FloatingSelect({ label, error, registerProps, options, disabled, className = "", placeholder, ...props }: any) {
  return (
    <div className="!relative !w-full !mb-2">
      <select
        {...registerProps}
        {...props}
        defaultValue={props.defaultValue ?? ""}
        disabled={disabled}
        className={`!block !px-4 !pb-2.5 !pt-5 !w-full !text-[14px] !text-gray-900 !bg-white dark:!bg-[#171821] !rounded-xl !border ${error ? '!border-rose-500 focus:!border-rose-500' : '!border-gray-200 dark:!border-[#262730] focus:!border-blue-600 dark:focus:!border-blue-500'} !appearance-none dark:!text-white focus:!outline-none focus:!ring-0 peer !transition-all ${disabled ? '!opacity-50 !cursor-not-allowed' : '!cursor-pointer'} ${className}`}
      >
        <option value="" disabled hidden>{placeholder || "Select an option"}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !pointer-events-none !text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <label htmlFor={props.id || registerProps?.name}
        className={`!absolute !text-[13px] ${error ? '!text-rose-500' : '!text-gray-500 dark:!text-gray-400 peer-focus:!text-blue-600 peer-focus:dark:!text-blue-500'} !duration-300 !transform !-translate-y-4 !scale-75 !top-4 !z-10 !origin-[0] !bg-white dark:!bg-[#171821] !px-2 peer-focus:!px-2 peer-placeholder-shown:!scale-100 peer-placeholder-shown:!-translate-y-1/2 peer-placeholder-shown:!top-1/2 peer-focus:!top-4 peer-focus:!scale-75 peer-focus:!-translate-y-4 start-3 !pointer-events-none`}
      >
        {label}
      </label>
      {error && <p className="!absolute !-bottom-5 !left-1 !text-rose-500 !text-[11px] !font-medium">{error}</p>}
    </div>
  );
}

export function FloatingTextarea({ label, error, registerProps, className = "", rows = 4, ...props }: any) {
  return (
    <div className="!relative !w-full !mb-2">
      <textarea
        {...registerProps}
        {...props}
        rows={rows}
        placeholder=" "
        className={`!block !px-4 !pb-2.5 !pt-5 !w-full !text-[14px] !text-gray-900 !bg-white dark:!bg-[#171821] !rounded-xl !border ${error ? '!border-rose-500 focus:!border-rose-500' : '!border-gray-200 dark:!border-[#262730] focus:!border-blue-600 dark:focus:!border-blue-500'} !appearance-none dark:!text-white focus:!outline-none focus:!ring-0 peer !transition-all !resize-none ${className}`}
      />
      <label htmlFor={props.id || registerProps?.name}
        className={`!absolute !text-[13px] ${error ? '!text-rose-500' : '!text-gray-500 dark:!text-gray-400 peer-focus:!text-blue-600 peer-focus:dark:!text-blue-500'} !duration-300 !transform !-translate-y-4 !scale-75 !top-4 !z-10 !origin-[0] !bg-white dark:!bg-[#171821] !px-2 peer-focus:!px-2 peer-placeholder-shown:!scale-100 peer-placeholder-shown:!top-6 peer-focus:!top-4 peer-focus:!scale-75 peer-focus:!-translate-y-4 start-3 !pointer-events-none`}
      >
        {label}
      </label>
      {error && <p className="!absolute !-bottom-5 !left-1 !text-rose-500 !text-[11px] !font-medium">{error}</p>}
    </div>
  );
}
