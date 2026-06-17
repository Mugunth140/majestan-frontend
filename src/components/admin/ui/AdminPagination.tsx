import React from "react";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  itemName?: string;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  itemName = "items",
  onPageChange,
}: AdminPaginationProps) {
  return (
    <div className="!p-5 !border-t !border-gray-100 dark:!border-[#262730] !flex !items-center !justify-between">
      <span className="!text-[14px] !text-gray-500 dark:!text-gray-400">
        Showing <span className="!font-medium !text-gray-800 dark:!text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="!font-medium !text-gray-800 dark:!text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="!font-medium !text-gray-800 dark:!text-white">{totalItems}</span> {itemName}
      </span>
      <div className="!flex !gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] disabled:!opacity-50 disabled:!cursor-not-allowed hover:!text-gray-800 dark:!text-white !transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= totalItems}
          className="!px-4 !py-2 !text-[14px] !font-medium !text-gray-500 dark:!text-gray-400 !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-lg hover:!bg-gray-50 dark:hover:!bg-[#1c1d27] disabled:!opacity-50 disabled:!cursor-not-allowed hover:!text-gray-800 dark:!text-white !transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
