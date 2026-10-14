"use client";

import { requestProjectEnquiry } from "@/components/site/project/enquiry-events";

/**
 * Opens the page's enquiry form with `message` pre-filled, so a lead from an
 * empty section arrives saying exactly what the buyer was missing.
 */
export function RequestButton({
  label,
  message,
  tone = "ink",
}: {
  label: string;
  message: string;
  /** "soft" is a pale blue outline, for sections that carry a lighter accent such as the FAQ. */
  tone?: "ink" | "soft";
}) {
  return (
    <button
      type="button"
      onClick={() => requestProjectEnquiry({ message })}
      className={`shrink-0! inline-flex! items-center! justify-center! rounded-full! ${tone === "soft" ? "bg-white! text-[#1645bf]! ring-1! ring-[#bcd0f7]! hover:bg-[#eef4ff]!" : "bg-[#0a0f1c]! text-white! hover:bg-[#1645bf]!"} px-4! py-2! text-sm! font-semibold! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! active:scale-[0.97]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!`}
    >
      {label}
    </button>
  );
}
