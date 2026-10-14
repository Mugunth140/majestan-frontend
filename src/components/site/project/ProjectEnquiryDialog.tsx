"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Phone, ShieldCheck, X } from "lucide-react";
import { useLockBodyScroll } from "@/components/site/shared/use-lock-body-scroll";
import { VISIT_SLOTS, formatSlot, todayYmd } from "@/lib/visit-slots";

/** Days offered in the visit date strip. Further dates are rarely booked from a listing. */
const VISIT_DAYS = 14;

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ymd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Today, unless every slot today has already passed — then tomorrow. */
export function firstBookableDate(): string {
  const now = new Date();
  const lastSlotHour = Number(VISIT_SLOTS[VISIT_SLOTS.length - 1].slice(0, 2));
  if (now.getHours() < lastSlotHour) return todayYmd();
  return ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
}

/**
 * The project enquiry and site-visit overlay: a calm white sheet. The project
 * heads it, and a two-way switch flips between asking a question and booking
 * a visit without closing — buyers often start one and want the other.
 * Portalled to document.body so sticky or transformed ancestors can't trap
 * the fixed layer.
 */
export function ProjectDialogShell({
  id,
  intent,
  projectName,
  city,
  onClose,
  onSwitch,
  children,
}: {
  id: string;
  intent: "enquire" | "visit";
  projectName: string;
  city: string;
  onClose: () => void;
  /** Flips to the other form. Omit to hide the switch (e.g. after success). */
  onSwitch?: (intent: "enquire" | "visit") => void;
  children: React.ReactNode;
}) {
  useLockBodyScroll();
  if (typeof document === "undefined") return null;
  const tabs = [
    { value: "enquire" as const, label: "Enquire", Icon: Phone },
    { value: "visit" as const, label: "Site visit", Icon: Calendar },
  ];

  return createPortal(
    <motion.div
      key={`${id}-backdrop`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="presentation"
      onClick={onClose}
      // Above the fixed site header (z-1000); the auth modal (z-9999) stays on top.
      className="fixed! inset-0! z-[1200]! flex! items-end! sm:items-center! justify-center! bg-[#0a0f1c]/40! backdrop-blur-[4px]! p-0! sm:p-4!"
    >
      <motion.div
        key={`${id}-card`}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(event) => event.stopPropagation()}
        className="font-manrope-page relative! w-full! max-w-[440px]! max-h-[92dvh]! overflow-y-auto! rounded-t-[28px]! sm:rounded-[28px]! bg-white! shadow-[0_40px_90px_-30px_rgba(10,15,28,0.4)]!"
      >
        {/* Grab handle: the sheet rises from the bottom on phones. */}
        <span aria-hidden="true" className="mx-auto! mt-2.5! block! h-1! w-10! rounded-full! bg-[#dfe4ec]! sm:hidden!" />

        <div className="px-6! pt-5! sm:pt-6!">
          <div className="flex! items-start! justify-between! gap-4!">
            <div className="min-w-0!">
              <h2
                id={`${id}-title`}
                className="m-0! mt-1! text-[22px]! font-semibold! leading-tight! tracking-[-0.025em]! text-[#0a0f1c]!"
              >
                {projectName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid! shrink-0! place-items-center! w-9! h-9! rounded-full! bg-[#f2f4f8]! text-[#465066]! cursor-pointer! transition-colors! duration-150! hover:bg-[#e6eaf1]! hover:text-[#0a0f1c]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]!"
            >
              <X className="w-4! h-4!" strokeWidth={2.25} />
            </button>
          </div>

          {onSwitch ? (
            <div role="tablist" aria-label="What would you like to do?" className="mt-5! grid! grid-cols-2! gap-1! rounded-2xl! bg-[#f2f4f8]! p-1!">
              {tabs.map(({ value, label, Icon }) => {
                const selected = value === intent;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => !selected && onSwitch(value)}
                    className={`flex! items-center! justify-center! gap-2! rounded-xl! border-0! py-2.5! text-sm! font-semibold! cursor-pointer! transition-[background-color,color,box-shadow]! duration-200! ease-out-quint! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! ${
                      selected
                        ? "bg-white! text-[#0a0f1c]! shadow-[0_1px_3px_rgba(10,15,28,0.12)]!"
                        : "bg-transparent! text-[#5f6b80]! hover:text-[#0a0f1c]!"
                    }`}
                  >
                    <Icon className={`w-4! h-4! ${selected ? "text-[#2563eb]!" : ""}`} aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="m-0! mt-2! text-sm! text-[#5f6b80]!">
              {intent === "visit" ? "Site visit" : "Enquiry"}
            </p>
          )}
        </div>

        <div className="px-6! pt-5! pb-6!">{children}</div>

        <p className="m-0! flex! items-center! justify-center! gap-1.5! bg-[#f7f9fc]! px-6! py-3.5! text-[12px]! text-[#5f6b80]!">
          <ShieldCheck className="w-3.5! h-3.5! text-emerald-600!" aria-hidden="true" />
          Zero brokerage on this project
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/**
 * Visit date as a strip of the next two weeks, then the hourly slots as a
 * grid. Slots already past today are disabled rather than hidden, so the grid
 * keeps its shape from day to day.
 */
export function VisitPicker({
  date,
  slot,
  onDate,
  onSlot,
}: {
  date: string;
  slot: string;
  onDate: (value: string) => void;
  onSlot: (value: string) => void;
}) {
  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: VISIT_DAYS }, (_, index) => {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      return { value: ymd(day), weekday: index === 0 ? "Today" : WEEKDAY[day.getDay()], date: day.getDate(), month: MONTH[day.getMonth()] };
    });
  }, []);
  const isToday = date === todayYmd();
  const nowHour = new Date().getHours();

  return (
    <div className="space-y-5!">
      <div>
        <p className="m-0! mb-2! text-sm! font-semibold! text-[#0a0f1c]!">Pick a day</p>
        <div role="radiogroup" aria-label="Visit date" className="hide-scrollbar -mx-6! flex! gap-2! overflow-x-auto! px-6! pb-1!">
          {days.map((day) => {
            const selected = day.value === date;
            return (
              <button
                key={day.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${day.weekday} ${day.date} ${day.month}`}
                onClick={() => onDate(day.value)}
                className={`flex! w-[60px]! shrink-0! flex-col! items-center! gap-0.5! rounded-2xl! border! py-2.5! cursor-pointer! transition-[background-color,border-color,color,transform]! duration-150! ease-out-quint! active:scale-[0.96]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! ${
                  selected
                    ? "border-[#9dbbf3]! bg-[#eef4ff]! text-[#1645bf]!"
                    : "border-[#e6ebf2]! bg-white! text-[#0a0f1c]! hover:border-[#cfdcf0]!"
                }`}
              >
                <span className={`text-[11px]! font-medium! ${selected ? "text-[#1645bf]/80!" : "text-[#5f6b80]!"}`}>{day.weekday}</span>
                <span className="text-lg! font-semibold! leading-none! tabular-nums!">{day.date}</span>
                <span className={`text-[11px]! ${selected ? "text-[#1645bf]/80!" : "text-[#5f6b80]!"}`}>{day.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="m-0! mb-2! text-sm! font-semibold! text-[#0a0f1c]!">Pick a time</p>
        <div role="radiogroup" aria-label="Visit time" className="grid! grid-cols-3! sm:grid-cols-4! gap-2!">
          {VISIT_SLOTS.map((value) => {
            const past = isToday && Number(value.slice(0, 2)) <= nowHour;
            const selected = value === slot;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={past}
                onClick={() => onSlot(value)}
                className={`rounded-xl! border! py-2! text-[13px]! font-semibold! tabular-nums! cursor-pointer! transition-[background-color,border-color,color]! duration-150! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! disabled:cursor-not-allowed! disabled:opacity-35! ${
                  selected
                    ? "border-[#9dbbf3]! bg-[#eef4ff]! text-[#1645bf]!"
                    : "border-[#e6ebf2]! bg-white! text-[#1c2433]! hover:enabled:border-[#cfdcf0]!"
                }`}
              >
                {formatSlot(value)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
