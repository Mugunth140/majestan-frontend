"use client";

import { requestProjectEnquiry } from "@/components/site/project/enquiry-events";

/**
 * Opens the page's enquiry form with `message` pre-filled, so a lead from an
 * empty section arrives saying exactly what the buyer was missing.
 */
export function RequestButton({ label, message }: { label: string; message: string }) {
  return (
    <button
      type="button"
      onClick={() => requestProjectEnquiry({ message })}
      className="shrink-0! inline-flex! items-center! justify-center! rounded-xl! bg-white! px-4! py-2! text-sm! font-semibold! text-[#27427f]! ring-1! ring-[#27427f]/25! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#27427f]/5! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
    >
      {label}
    </button>
  );
}
