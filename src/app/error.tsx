'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="!min-h-screen !flex !flex-col !items-center !justify-center !bg-gray-50 dark:!bg-[#0f1015] !p-6 !text-center">
      <div className="!w-16 !h-16 !rounded-full !bg-red-100 dark:!bg-red-500/10 !flex !items-center !justify-center !mb-6">
        <AlertCircle className="!w-8 !h-8 !text-red-600 dark:!text-red-500" />
      </div>
      <h1 className="!text-3xl !font-bold !text-gray-900 dark:!text-white !mb-3">
        Something went wrong
      </h1>
      <p className="!text-gray-500 dark:!text-gray-400 !max-w-md !mb-8">
        We encountered an unexpected error while loading this page. This might be due to a temporary network issue or a missing configuration.
      </p>
      <button
        onClick={() => reset()}
        className="!px-6 !py-3 !bg-[#27427f] !text-white !font-medium !rounded-xl hover:!bg-[#1c2f5a] !transition-all"
      >
        Try again
      </button>
    </div>
  );
}
