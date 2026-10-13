"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X, type LucideIcon } from "lucide-react";
import * as LucideComponents from "lucide-react";
import { icons as LUCIDE_ICONS } from "lucide-react";
import { getIconForAmenity } from "@/components/site/property/sections/AmenitiesSection";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";
import { numberToIndianWords, parseIndianCurrency } from "@/lib/utils/currency.util";
import styles from "./owner-post-controls.module.css";

type PopupPosition = { top: number; left: number; width: number; maxHeight: number };

function usePopupPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  popupRef: RefObject<HTMLElement | null>,
) {
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const placeAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(140, Math.min(320, placeAbove ? spaceAbove : spaceBelow));
    setPosition({
      top: placeAbove ? Math.max(8, rect.top - maxHeight - 6) : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: rect.width,
      maxHeight,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return;
    update();
    const onScroll = () => update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", onScroll, true);
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(update);
    if (anchorRef.current) observer?.observe(anchorRef.current);
    if (popupRef.current) observer?.observe(popupRef.current);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onScroll, true);
      observer?.disconnect();
    };
  }, [anchorRef, open, popupRef, update]);

  return position;
}

function useOutsideDismiss(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  popupRef: RefObject<HTMLElement | null>,
  dismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !popupRef.current?.contains(target)) dismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        anchorRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, dismiss, open, popupRef]);
}

export type OwnerPostSelectOption = string | { value: string; label: string };

const MAX_SELECT_OPTIONS = 48;

function normalizeOption(option: OwnerPostSelectOption) {
  return typeof option === "string" ? { value: option, label: optionLabel(option) } : option;
}

function optionLabel(option: string) {
  return option.replaceAll("-", " to ");
}

export function OwnerPostSelect({
  id,
  name,
  value,
  options,
  placeholder,
  invalid,
  describedBy,
  disabled,
  searchable = false,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  options: OwnerPostSelectOption[];
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
  searchable?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const didFocusOnOpenRef = useRef(false);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const popupId = useId();
  const position = usePopupPosition(open, anchorRef, popupRef);
  const dismiss = useCallback(() => setOpen(false), []);
  useOutsideDismiss(open, anchorRef, popupRef, dismiss);
  const normalized = options.map(normalizeOption);
  const filtered = normalized.filter((option) =>
    !searchable || option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visible = filtered.slice(0, MAX_SELECT_OPTIONS);
  const selectedIndex = normalized.findIndex((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      didFocusOnOpenRef.current = false;
      return;
    }
    if (!position || didFocusOnOpenRef.current) return;
    didFocusOnOpenRef.current = true;
    if (searchable) searchRef.current?.focus();
    else optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open, position, searchable]);

  const openMenu = () => {
    setQuery("");
    setActiveIndex(Math.min(Math.max(0, selectedIndex), MAX_SELECT_OPTIONS - 1));
    setOpen(true);
  };

  const choose = (option: { value: string; label: string }) => {
    onChange(option.value);
    setOpen(false);
    requestAnimationFrame(() => anchorRef.current?.focus());
  };

  const focusOption = (index: number) => {
    if (!visible.length) return;
    const nextIndex = Math.max(0, Math.min(index, visible.length - 1));
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  };

  const onOptionKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption((index + (event.key === "ArrowDown" ? 1 : -1) + visible.length) % visible.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(visible.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(visible[index]);
    }
  };

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <button
        ref={anchorRef}
        id={id}
        type="button"
        className={`${styles.selectTrigger} ${invalid ? styles.invalid : ""}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (open && visible.length) {
              focusOption((activeIndex + (event.key === "ArrowDown" ? 1 : -1) + visible.length) % visible.length);
            } else if (!open) openMenu();
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) openMenu();
          } else if (event.key.length === 1 && event.key.trim()) {
            const match = normalized.findIndex((item) => item.label.toLowerCase().startsWith(event.key.toLowerCase()));
            if (match >= 0) {
              setActiveIndex(Math.min(match, MAX_SELECT_OPTIONS - 1));
              if (!open) setOpen(true);
            }
          }
        }}
      >
        <span className={value ? styles.selectValue : styles.selectPlaceholder}>
          {normalized.find((option) => option.value === value)?.label ?? placeholder}
        </span>
        <ChevronDown aria-hidden="true" size={17} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>
      {open && position && createPortal(
        <div
          ref={popupRef}
          className={styles.selectPopup}
          style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }}
        >
          {searchable && (
            <label className={styles.selectSearch}>
              <Search aria-hidden="true" size={15} />
              <input
                ref={searchRef}
                type="search"
                value={query}
                aria-label={`Search ${name}`}
                placeholder="Type to search"
                onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
                onKeyDown={(event) => {
                  if ((event.key === "ArrowDown" || event.key === "ArrowUp") && visible.length) {
                    event.preventDefault();
                    focusOption(event.key === "ArrowDown" ? 0 : visible.length - 1);
                  }
                }}
              />
            </label>
          )}
          {filtered.length > MAX_SELECT_OPTIONS && <p className={styles.selectCount}>Showing {MAX_SELECT_OPTIONS} of {filtered.length}. Refine your search to see more.</p>}
          <div id={popupId} role="listbox" aria-labelledby={id}>
          {visible.map((option, index) => {
            const active = value === option.value;
            return (
              <button
                key={`${option.value}-${index}`}
                ref={(node) => { optionRefs.current[index] = node; }}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={index === activeIndex ? 0 : -1}
                className={`${styles.selectOption} ${active ? styles.optionSelected : ""}`}
                onClick={() => choose(option)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
              >
                <span>{option.label}</span>
                {active && <Check aria-hidden="true" size={15} />}
              </button>
            );
          })}
          {!visible.length && <p className={styles.noResults}>No matching options.</p>}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export function StableCheckbox({
  id,
  name,
  label,
  checked,
  invalid,
  describedBy,
  error,
  errorId,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  invalid?: boolean;
  describedBy?: string;
  error?: string;
  errorId?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={styles.checkboxWrap}>
      <label className={`${styles.checkboxChoice} ${invalid ? styles.invalidChoice : ""}`}>
        <input
          className={styles.checkboxInput}
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={styles.checkboxMark} aria-hidden="true">
          {checked && <Check size={13} strokeWidth={2.5} />}
        </span>
        <span>{label}</span>
      </label>
      {error && <p className={styles.fieldError} id={errorId}>{error}</p>}
    </div>
  );
}

export function PriceAmountInput({
  id,
  name,
  value,
  min,
  max,
  required,
  invalid,
  describedBy,
  placeholder,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  min?: number;
  max?: number;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const numeric = parseIndianCurrency(value);
  const words = value.trim() && Number.isFinite(numeric) && numeric > 0
    ? numberToIndianWords(numeric)
    : "";
  return (
    <div className={styles.priceWrap}>
      <div className={styles.currencyInputWrap}>
        <span className={styles.currencyMark} aria-hidden="true">₹</span>
        <input
          className={`${styles.input} ${styles.currencyInput} ${invalid ? styles.invalid : ""}`}
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step="0.01"
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          value={value}
          placeholder={placeholder}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        />
      </div>
      {words && <p className={styles.amountWords} aria-live="polite">{words}</p>}
    </div>
  );
}

const MAX_VISIBLE_CATALOG_ITEMS = 48;

type CatalogItem = { id: number; name: string; iconKey?: string | null; icon?: string | null };

export function CatalogChoices({
  title,
  items,
  selected,
  onChange,
  searchPlaceholder,
}: {
  title: string;
  items: CatalogItem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const popupId = useId();
  const position = usePopupPosition(open, anchorRef, popupRef);
  const dismiss = useCallback(() => setOpen(false), []);
  useOutsideDismiss(open, anchorRef, popupRef, dismiss);

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  if (!items.length) return null;
  const selectedItems = items.filter((item) => selected.includes(item.id));
  const filtered = items.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  const visibleItems = filtered.slice(0, MAX_VISIBLE_CATALOG_ITEMS);

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((selectedId) => selectedId !== id) : [...selected, id]);
  };
  const itemIcon = (item: CatalogItem): LucideIcon => {
    const iconKey = item.iconKey ?? item.icon;
    if (!iconKey) return getIconForAmenity(item.name) as LucideIcon;
    const canonicalName = iconKey.split(/[-_]/).map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join("");
    if (canonicalName in LUCIDE_ICONS) {
      const icon = (LucideComponents as Record<string, unknown>)[canonicalName];
      if (icon) return icon as LucideIcon;
    }
    return connectivityIconFor(iconKey);
  };

  return (
    <fieldset className={styles.catalog}>
      <legend className={styles.catalogLegend}>{title}<span className={styles.optional}> Optional</span></legend>
      <button
        ref={anchorRef}
        className={styles.catalogTrigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.catalogTriggerText}>
          {selected.length ? `${selected.length} selected` : "Search and choose"}
        </span>
        <ChevronDown aria-hidden="true" size={17} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>
      {selectedItems.length > 0 && (
        <ul className={styles.selectedCatalog} aria-label={`Selected ${title.toLowerCase()}`}>
          {selectedItems.map((item) => {
            const Icon = itemIcon(item);
            return (
              <li key={item.id} className={styles.selectedCatalogItem}>
                <Icon aria-hidden="true" size={14} />
                <span>{item.name}</span>
                <button type="button" aria-label={`Remove ${item.name}`} onClick={() => toggle(item.id)}>
                  <X aria-hidden="true" size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && position && createPortal(
        <div
          ref={popupRef}
          id={popupId}
          className={styles.catalogPopup}
          style={{
            top: position.top,
            left: Math.max(8, Math.min(position.left, window.innerWidth - Math.min(Math.max(position.width, 300), window.innerWidth - 16) - 8)),
            width: Math.min(Math.max(position.width, 300), window.innerWidth - 16),
            maxHeight: position.maxHeight,
          }}
          role="dialog"
          aria-label={`Choose ${title.toLowerCase()}`}
        >
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={16} />
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}`}
              aria-label={`Search ${title.toLowerCase()}`}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {filtered.length > MAX_VISIBLE_CATALOG_ITEMS && (
            <p className={styles.catalogCount}>Showing {MAX_VISIBLE_CATALOG_ITEMS} of {filtered.length}. Refine your search to see more.</p>
          )}
          <ul className={styles.catalogOptions}>
            {visibleItems.map((item) => {
              const Icon = itemIcon(item);
              const checked = selected.includes(item.id);
              return (
                <li key={item.id}>
                  <button type="button" className={`${styles.catalogOption} ${checked ? styles.catalogOptionSelected : ""}`} aria-pressed={checked} onClick={() => toggle(item.id)}>
                    <span className={styles.catalogOptionIcon}><Icon aria-hidden="true" size={17} /></span>
                    <span className={styles.catalogOptionName}>{item.name}</span>
                    <span className={`${styles.catalogCheck} ${checked ? styles.catalogCheckSelected : ""}`} aria-hidden="true">{checked && <Check size={13} />}</span>
                  </button>
                </li>
              );
            })}
            {!visibleItems.length && <li className={styles.noResults}>No matching options.</li>}
          </ul>
        </div>,
        document.body,
      )}
    </fieldset>
  );
}
