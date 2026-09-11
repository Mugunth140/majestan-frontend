"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  buttonClassName?: string;
  ariaLabel?: string;
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  leadingIcon,
  trailingIcon,
  buttonClassName = "",
  ariaLabel,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative! w-full!">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`w-full! flex! items-center! gap-2! bg-white! border! border-gray-200! rounded-lg! py-2.5! pl-3! pr-8! text-[13px]! font-medium! text-gray-800! hover:border-[#27427f]/40! focus:outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! transition-all! cursor-pointer! ${buttonClassName}`}
      >
        {leadingIcon ? <span className="shrink-0!">{leadingIcon}</span> : null}
        <span className="flex-1! text-left! truncate!">
          {selected ? selected.label : <span className="text-gray-400! font-normal!">{placeholder}</span>}
        </span>
        <span className="absolute! right-3! top-1/2! -translate-y-1/2! pointer-events-none!">
          {trailingIcon ?? (
            <ChevronDown
              className={`w-4! h-4! text-gray-400! transition-transform! duration-200! ${open ? "rotate-180!" : ""}`}
            />
          )}
        </span>
      </button>
      {open && (
        <div className="absolute! z-30! top-full! left-0! right-0! mt-1.5! bg-white! border! border-gray-200/80! rounded-lg! shadow-[0_12px_32px_rgba(22,30,45,0.14)]! py-1! max-h-56! overflow-y-auto!">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value + opt.label}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full! flex! items-center! justify-between! gap-2! px-3! py-2! text-[13px]! text-left! transition-colors! cursor-pointer! ${
                  active
                    ? "font-semibold! text-[#27427f]! bg-[#27427f]/[0.06]!"
                    : "font-normal! text-gray-600! hover:bg-gray-50! hover:text-gray-900!"
                }`}
              >
                <span className="truncate!">{opt.label}</span>
                {active && <Check className="w-3.5! h-3.5! shrink-0!" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
