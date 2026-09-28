"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, MessageCircle } from "lucide-react";
import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { parsePseoSlug } from "@/lib/seo-urls";

/* ── Spring vocabulary ─────────────────────────────────────────────────────
   One critically-damped spring for the trigger (response 0.32) and one
   under-damped spring for the card (a touch of settle). Every transition
   reads the live value, so re-tapping mid-flight reverses cleanly.        */
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 } as const;
const SPRING_CARD = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

export function WhatsAppPopup({
  pageUrl,
  listingType,
  propertyType,
  location,
}: {
  pageUrl: string;
  listingType?: string;
  propertyType?: string;
  location?: string;
}) {
  // The card belongs to the page it was opened on: a route change makes it
  // stale by definition, so "open" is derived rather than reset in an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pageUrl;
  const setOpen = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
    setOpenedOn((prev) => {
      const next = typeof v === "function" ? v(prev === pageUrl) : v;
      return next ? pageUrl : null;
    });
  }, [pageUrl]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [pressed, setPressed] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusables = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])'
        )
      ).filter((el) => el.tabIndex !== -1);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !cardRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    // Dismiss on a press that starts outside the widget — no full-page scrim,
    // so the page underneath stays interactive while the card is open.
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open, setOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg("Please enter your name.");
      setStatus("error");
      return;
    }
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await createEnquiry({
        name: trimmed,
        phone: normalized,
        source: "whatsapp_popup",
        pageUrl: pageUrl + window.location.search,
        listingType,
        propertyType,
        location,
        whatsappOptIn: true,
      });
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  // Reduced motion: cross-fade only, no scale, no travel.
  const cardMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.88, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.94, y: 8 },
      };

  return (
    <div
      ref={rootRef}
      className="fixed! z-[9999]! flex! flex-col! items-end! gap-3!
                 right-4! sm:right-6!
                 bottom-[calc(1.25rem+env(safe-area-inset-bottom))]! sm:bottom-6!"
    >
      {/* Card — grows out of the trigger, so its origin is the trigger itself. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={cardRef}
            variants={cardMotion}
            transition={reduceMotion ? { duration: 0.15 } : SPRING_CARD}
            style={{ transformOrigin: "bottom right" }}
            role="dialog"
            aria-label="Enquire via WhatsApp"
            className="w-[min(20rem,calc(100vw-2rem))]! overflow-hidden! rounded-3xl!
                       border! border-white/60! bg-white/85!
                       shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-8px_rgba(16,24,40,0.18)]!
                       backdrop-blur-xl! backdrop-saturate-150!"
          >
            {/* Header */}
            <div className="flex! items-center! gap-2.5! px-4! py-3.5!">
              <span className="grid! h-7! w-7! place-items-center! rounded-full! bg-[#27427f]! text-white!">
                <MessageCircle className="h-4! w-4! fill-white!" aria-hidden />
              </span>
              <div className="min-w-0!">
                <p className="truncate! text-[13px]! font-semibold! leading-tight! tracking-[-0.01em]! text-slate-900! font-['Manrope',sans-serif]!">
                  Get details on WhatsApp
                </p>
                <p className="text-[11px]! leading-tight! text-slate-500! font-['Manrope',sans-serif]!">
                  We reply within a few hours
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="ml-auto! -mr-1! grid! h-8! w-8! shrink-0! cursor-pointer! place-items-center!
                           rounded-full! text-slate-500! transition-colors! hover:bg-slate-900/5! hover:text-slate-900!
                           focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-[#27427f]!"
              >
                <X className="h-4! w-4!" aria-hidden />
              </button>
            </div>

            {/* Body */}
            <div className="border-t! border-slate-900/5! px-4! pb-4! pt-3.5! flex! flex-col! gap-3!">
              {status === "success" ? (
                <p className="text-[13px]! text-slate-700! font-medium! leading-relaxed! py-1! font-['Manrope',sans-serif]!">
                  Thanks {name.trim().split(" ")[0] || "there"}! Our team will reach out to you shortly.
                </p>
              ) : (
                <form className="flex! flex-col! gap-2!" onSubmit={handleSubmit}>
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    aria-label="Your name"
                    required
                    className="w-full! p-3! text-sm! border! border-slate-200! bg-white/70! rounded-xl! outline-none!
                               focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-slate-400!
                               font-['Manrope',sans-serif]!"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    autoComplete="tel"
                    inputMode="numeric"
                    aria-label="Phone number"
                    required
                    pattern="[0-9+ ]{10,15}"
                    className="w-full! p-3! text-sm! border! border-slate-200! bg-white/70! rounded-xl! outline-none!
                               focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-slate-400!
                               font-['Manrope',sans-serif]!"
                  />
                  {status === "error" && errorMsg && (
                    <p role="alert" className="text-[12px]! text-red-600! font-medium! font-['Manrope',sans-serif]!">
                      {errorMsg}
                    </p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={status === "submitting"}
                    whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                    transition={SPRING}
                    className="flex! items-center! justify-center! w-full! py-2.5! bg-[#27427f]! text-white! text-sm!
                               font-semibold! rounded-xl! cursor-pointer! transition-colors! hover:bg-[#1a2d59]!
                               disabled:opacity-60! disabled:cursor-not-allowed! font-['Manrope',sans-serif]!"
                  >
                    {status === "submitting" ? "Requesting…" : "Request callback"}
                  </motion.button>
                  <p className="text-[11px]! text-slate-500! leading-relaxed! font-['Manrope',sans-serif]! text-center!">
                    By enquiring, you agree to our{" "}
                    <Link href="/privacy-policy" className="text-[#27427f]! font-semibold! hover:underline!">
                      Terms &amp; Conditions.
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger — one 56pt target that owns the icon swap. */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        animate={{ scale: pressed ? 0.93 : 1 }}
        whileHover={reduceMotion ? undefined : { scale: pressed ? 0.93 : 1.04 }}
        transition={SPRING}
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp enquiry" : "Get details via WhatsApp"}
        className="relative! grid! h-14! w-14! shrink-0! cursor-pointer! place-items-center! rounded-full!
                   bg-[#27427f]! text-white!
                   shadow-[0_1px_2px_rgba(16,24,40,0.16),0_8px_24px_-6px_rgba(39,66,127,0.45)]!
                   focus-visible:outline-2! focus-visible:outline-offset-3! focus-visible:outline-[#27427f]!"
      >
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 90 : 0, scale: open ? 0.6 : 1, opacity: open ? 0 : 1 }}
          transition={reduceMotion ? { duration: 0.12 } : SPRING}
          className="absolute! inset-0! grid! place-items-center!"
        >
          <MessageCircle className="h-6! w-6! fill-white!" />
        </motion.span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 0 : -90, scale: open ? 1 : 0.6, opacity: open ? 1 : 0 }}
          transition={reduceMotion ? { duration: 0.12 } : SPRING}
          className="absolute! inset-0! grid! place-items-center!"
        >
          <X className="h-5! w-5!" />
        </motion.span>
      </motion.button>
    </div>
  );
}

const HIDDEN_PREFIXES = ["/admin", "/login", "/register"];

/**
 * Site-wide floating WhatsApp enquiry button. Render once in the root layout.
 * Skips auth/admin screens, and skips PSEO listing pages because ListingShell
 * already renders its own contextual instance (with listing filters) there —
 * so exactly one icon is ever on screen.
 */
export function GlobalWhatsAppEnquiry() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  if (slug && !slug.includes("/") && parsePseoSlug(slug)) {
    return null;
  }
  return <WhatsAppPopup pageUrl={pathname} />;
}
