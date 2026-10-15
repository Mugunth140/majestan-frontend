"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search } from "lucide-react";
import { COUNTRIES, flagOf, PINNED_COUNTRIES, type Country } from "@/lib/country-codes";

const FONT = "!font-['Manrope',sans-serif]";

/**
 * The country code list, opened inline under the phone field. Inline rather
 * than a floating popover so the modal's scroll area can never clip it, and
 * so it reads as part of the form.
 *
 * Search matches the name, the dialling code ("971", "+971") or the ISO code.
 * Arrow keys move, Enter picks, Escape closes the list (not the modal).
 */
export function CountryList({
  value,
  onSelect,
  onClose,
}: {
  value: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const digits = q.replace(/[^\d]/g, "");
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase() === q ||
        (digits.length > 0 && c.dial.slice(1).startsWith(digits)),
    );
  }, [query]);

  // Keep the highlighted row on screen while arrowing through the list.
  useEffect(() => {
    const row = listRef.current?.children[active] as HTMLElement | undefined;
    row?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) onSelect(results[active]);
    } else if (e.key === "Escape") {
      // Close the list only; the modal listens for Escape on window.
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const showDivider = !query.trim();

  return (
    <div className="!overflow-hidden !rounded-xl !border !border-[#dfe3eb] !bg-white !shadow-[0_12px_32px_-16px_rgba(13,20,36,0.25)]">
      <div className="!flex !items-center !gap-2.5 !border-b !border-[#eef0f4] !px-3.5">
        <Search size={16} className="!shrink-0 !text-[#8a94a6]" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search country or code"
          aria-label="Search country or code"
          aria-controls="user-auth-country-list"
          aria-activedescendant={results[active] ? `country-${results[active].iso}` : undefined}
          className={`!m-0 !h-11 !min-w-0 !flex-1 !appearance-none !rounded-none !border-0 !bg-transparent !p-0 !text-[14px] !font-medium !text-[#161e2d] !shadow-none !outline-none placeholder:!font-medium placeholder:!text-[#98a1b2] ${FONT}`}
        />
      </div>

      <ul
        ref={listRef}
        id="user-auth-country-list"
        role="listbox"
        aria-label="Country code"
        className="!m-0 !max-h-[220px] !list-none !overflow-y-auto !overscroll-contain !p-1.5"
      >
        {results.length === 0 && (
          <li className={`!px-3 !py-6 !text-center !text-[13px] !font-medium !text-[#5c5e61] ${FONT}`}>
            No matching country
          </li>
        )}
        {results.map((c, i) => {
          const selected = c.iso === value.iso;
          const lastPinned = showDivider && c.iso === PINNED_COUNTRIES[PINNED_COUNTRIES.length - 1];
          return (
            <li
              key={c.iso}
              id={`country-${c.iso}`}
              role="option"
              aria-selected={selected}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(c)}
              className={`!flex !cursor-pointer !items-center !gap-3 !rounded-lg !px-2.5 !py-2 !text-[14px] ${FONT} ${
                i === active ? "!bg-[#f3f6fb]" : ""
              } ${lastPinned ? "!mb-1.5 !shadow-[0_7px_0_-6px_#eef0f4]" : ""}`}
            >
              <span className="!text-[18px] !leading-none" aria-hidden="true">
                {flagOf(c.iso)}
              </span>
              <span className={`!min-w-0 !flex-1 !truncate !font-medium ${selected ? "!text-[#27427f]" : "!text-[#161e2d]"}`}>
                {c.name}
              </span>
              <span className="!shrink-0 !font-semibold !tabular-nums !text-[#5c5e61]">{c.dial}</span>
              <Check
                size={15}
                strokeWidth={2.5}
                aria-hidden="true"
                className={`!shrink-0 !text-[#27427f] ${selected ? "!opacity-100" : "!opacity-0"}`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
