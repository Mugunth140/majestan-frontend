"use client";

import { useEffect, useState } from "react";

/* Office hours in IST, matching DETAILS.hours: Monday–Saturday 9:00–18:00. */
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

function officeNow(): { day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, hour: Number(get("hour")) % 24, minute: Number(get("minute")) };
}

/**
 * "Open now" or when the office opens next, from the published hours in the
 * office's own time zone. Rendered after mount only, since the server's clock
 * and time zone say nothing about the visitor's moment.
 */
export function OpenStatus() {
  const [label, setLabel] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const { day, hour } = officeNow();
      const workday = day >= 1 && day <= 6;
      if (workday && hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
        setLabel({ open: true, text: "Open now · until 6:00 PM" });
        return;
      }
      const beforeOpening = workday && hour < OPEN_HOUR;
      const opensToday = beforeOpening;
      const opensMonday = day === 6 || day === 0; // after Saturday's close, or on Sunday
      setLabel({
        open: false,
        text: opensToday ? "Closed · opens today at 9:00 AM" : opensMonday ? "Closed · opens Monday at 9:00 AM" : "Closed · opens tomorrow at 9:00 AM",
      });
    };
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!label) return <span className="h-[30px]!" aria-hidden="true" />;

  return (
    <p className="m-0! inline-flex! items-center! gap-2! rounded-full! bg-white! px-3! py-1.5! text-[13px]! text-[#1c2433]! ring-1! ring-[#e6ebf2]!">
      <span
        aria-hidden="true"
        className={`relative! inline-flex! h-2! w-2! rounded-full! ${label.open ? "bg-emerald-500!" : "bg-[#9aa4b5]!"}`}
      >
        {label.open && <span className="absolute! inset-0! animate-ping! rounded-full! bg-emerald-400! opacity-60! motion-reduce:hidden!" />}
      </span>
      {label.text}
    </p>
  );
}
