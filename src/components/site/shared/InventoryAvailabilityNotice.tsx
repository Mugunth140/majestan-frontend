import { inventoryAvailability } from "@/lib/inventory-availability";
export function InventoryAvailabilityNotice({ status }: { status: unknown }) {
  const label = inventoryAvailability(status);
  return label ? (
    <div
      role="status"
      className="mt-4! flex! items-start! gap-3! rounded-lg! border! border-red-200! bg-red-50! p-4! text-left!"
    >
      <span className="flex! h-8! w-8! shrink-0! items-center! justify-center! rounded-full! bg-red-100! text-red-600!" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="m6 6 12 12" />
        </svg>
      </span>
      <div className="min-w-0!">
        <p className="m-0! text-base! font-semibold! text-red-700!">{label}</p>
        <p className="m-0! mt-1! text-sm! font-normal! text-red-800!">Enquiries and visits are closed.</p>
      </div>
    </div>
  ) : null;
}
