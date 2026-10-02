"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Phone, X, Loader2, CheckCircle2, Pencil, Check, Lock } from "lucide-react";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { useUserAuthStore } from "@/store/userAuthStore";
import { createPropertyEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { VISIT_SLOTS, formatSlot, isValidVisitDate, todayYmd } from "@/lib/visit-slots";

export type EnquiryPropertyRef = {
  id: number;
  propertyCode: string | null;
  slug: string | null;
  title: string;
  propertyType: string;
  listingType: string;
  city: string;
};

type Intent = "enquire" | "visit";
type Status = "idle" | "submitting" | "success" | "error";

interface PropertyEnquiryActionsProps {
  property: EnquiryPropertyRef;
}

/** The backend sets this placeholder for OTP-login users who skipped name entry. */
const PLACEHOLDER_NAME = "Majestan User";

function isRealName(name: string | undefined | null): boolean {
  return !!name && name.trim().length > 0 && name.trim() !== PLACEHOLDER_NAME;
}

export function PropertyEnquiryActions({ property }: PropertyEnquiryActionsProps) {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const authedUser = useUserAuthStore((s) => s.user);
  const token = useUserAuthStore((s) => s.token);

  const [authOpen, setAuthOpen] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null);
  const [dialog, setDialog] = useState<Intent | null>(null);

  // Contact details — phone is always locked (it's the auth identity)
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Visit form state
  const [visitDate, setVisitDate] = useState(todayYmd());
  const [visitSlot, setVisitSlot] = useState("");

  // Shared
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function seedFromUser() {
    if (authedUser) {
      const storedName = authedUser.name || "";
      setName(isRealName(storedName) ? storedName : "");
      // Start in edit mode if we don't have a real name
      setEditingName(!isRealName(storedName));
    }
  }

  function openIntent(which: Intent) {
    if (!isAuthenticated) {
      setPendingIntent(which);
      setAuthOpen(true);
      return;
    }
    seedFromUser();
    setStatus("idle");
    setErrorMsg("");
    setVisitSlot("");
    setVisitDate(todayYmd());
    setDialog(which);
  }

  // After OTP login, resume the pending intent
  useEffect(() => {
    if (isAuthenticated && pendingIntent) {
      seedFromUser();
      setStatus("idle");
      setErrorMsg("");
      setVisitSlot("");
      setVisitDate(todayYmd());
      setDialog(pendingIntent);
      setPendingIntent(null);
    }
    // intentional: re-seed only when auth state or pending intent changes,
    // not on every profile update (seedFromUser reads auth store imperatively)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pendingIntent]);

  // Focus name input when edit mode activates
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  // Escape closes open dialog
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  function closeDialog() {
    setDialog(null);
    setStatus("idle");
    setErrorMsg("");
    setEditingName(false);
  }

  function getPhone(): string {
    return normalizeIndianPhone(authedUser?.phone || "") || authedUser?.phone || "";
  }

  function displayPhone(): string {
    const raw = authedUser?.phone || "";
    // Already has +91 prefix → show as-is; otherwise prefix it
    if (raw.startsWith("+")) return raw;
    if (raw.length === 10) return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
    return raw;
  }

  async function handleSubmit(intent: "enquiry" | "site_visit") {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMsg("Please enter your name before submitting.");
      setStatus("error");
      setEditingName(true);
      return;
    }
    const normalized = getPhone();
    if (!normalized) {
      setErrorMsg("Could not read your phone number. Please log out and log in again.");
      setStatus("error");
      return;
    }
    if (intent === "site_visit" && (!isValidVisitDate(visitDate) || !visitSlot)) {
      setErrorMsg("Please pick a date and time slot.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await createPropertyEnquiry(
        {
          propertyId: property.id,
          propertyCode: property.propertyCode,
          slug: property.slug,
          name: trimmedName,
          phone: normalized,
          intent,
          ...(intent === "site_visit" ? { visitDate, visitSlot } : {}),
        },
        token!,
      );
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  // ─── Shared styles ────────────────────────────────────────────────────────
  const inputClass =
    "w-full! px-[13px]! py-[10px]! rounded-[10px]! bg-white! border! border-gray-300! " +
    "text-[14px]! text-[#161e2d]! outline-none! transition-colors! duration-150! " +
    "placeholder:text-gray-400! focus:border-[#27427f]!";

  const labelClass = "block! text-[11px]! font-semibold! uppercase! tracking-[0.1em]! text-gray-400! mb-[4px]!";

  // ─── Contact card (shared between both dialogs) ────────────────────────────
  function ContactCard() {
    return (
      <div className="rounded-[14px]! bg-gray-50! border! border-gray-100! p-4! space-y-3! mb-5!">
        <p className="text-[11px]! font-semibold! uppercase! tracking-[0.1em]! text-gray-400!">
          Your contact details
        </p>

        {/* Name row */}
        <div>
          <p className={labelClass}>Name</p>
          {editingName ? (
            <div className="flex! items-center! gap-2!">
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputClass + " flex-1!"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim().length >= 2) setEditingName(false);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (name.trim().length >= 2) setEditingName(false);
                }}
                disabled={name.trim().length < 2}
                className="shrink-0! w-8! h-8! rounded-lg! bg-[#27427f]! text-white! flex! items-center! justify-center! disabled:opacity-40! transition-opacity!"
                aria-label="Save name"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex! items-center! justify-between! gap-2!">
              <span className="text-[15px]! font-medium! text-[#161e2d]! leading-snug!">
                {name || <span className="text-gray-400 italic">Not provided</span>}
              </span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="shrink-0! flex! items-center! gap-1! text-[12px]! text-[#27427f]! hover:underline! transition-colors!"
                aria-label="Edit name"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Phone row — always locked */}
        <div>
          <p className={labelClass}>Mobile</p>
          <div className="flex! items-center! gap-2!">
            <span className="text-[15px]! font-medium! text-[#161e2d]! flex-1! leading-snug!">
              {displayPhone()}
            </span>
            <span className="flex! items-center! gap-1! text-[11px]! text-gray-400!">
              <Lock size={11} />
              Verified
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dialog shell ──────────────────────────────────────────────────────────
  function DialogShell({
    id,
    eyebrow,
    children,
  }: {
    id: string;
    eyebrow: string;
    children: React.ReactNode;
  }) {
    return (
      <motion.div
        key={`${id}-backdrop`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        role="presentation"
        onClick={closeDialog}
        className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! bg-gray-900/40! backdrop-blur-sm! p-4!"
      >
        <motion.div
          key={`${id}-card`}
          initial={{ opacity: 0, y: 52, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 36, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          onClick={(e) => e.stopPropagation()}
          className="relative! w-full! max-w-md! rounded-[2rem]! bg-white! border! border-gray-100! shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]! p-8! sm:p-10!"
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="absolute! top-5! right-5! w-8! h-8! rounded-full! bg-gray-100! flex! items-center! justify-center! text-gray-500! hover:bg-gray-200! hover:text-gray-900! transition-colors!"
          >
            <X size={15} strokeWidth={2.5} />
          </motion.button>

          <div className="mb-5!">
            <span className="block! mb-1.5! text-[10px]! font-semibold! uppercase! tracking-[0.14em]! text-[#27427f]!">
              {eyebrow}
            </span>
            <h4
              id={`${id}-title`}
              className="pr-8! text-[20px]! font-semibold! leading-snug! tracking-tight! text-[#161e2d]!"
            >
              {property.title}
            </h4>
          </div>

          {children}
        </motion.div>
      </motion.div>
    );
  }

  // ─── Success state ─────────────────────────────────────────────────────────
  function SuccessState({ message }: { message: string }) {
    return (
      <motion.div
        key="ok"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="py-10! text-center!"
      >
        <div className="mx-auto! mb-4! flex! h-12! w-12! items-center! justify-center! rounded-full! bg-emerald-50!">
          <CheckCircle2 className="h-6! w-6! text-emerald-600!" aria-hidden="true" />
        </div>
        <p className="text-[15px]! font-medium! text-[#161e2d]!">
          Thank you, {name.trim() || ""}!
        </p>
        <p className="mt-[5px]! text-[14px]! leading-[1.6]! text-gray-600!">{message}</p>
      </motion.div>
    );
  }

  // ─── Submit button ─────────────────────────────────────────────────────────
  function SubmitBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
      <motion.button
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        type="button"
        disabled={status === "submitting"}
        onClick={onClick}
        className="w-full! bg-[#27427f]! text-white! font-manrope! font-semibold! text-[15px]! py-3! rounded-xl! hover:bg-[#1e3366]! transition-all! flex! items-center! justify-center! gap-2! disabled:opacity-70! disabled:cursor-not-allowed!"
      >
        {status === "submitting" ? <Loader2 size={20} className="animate-spin!" /> : label}
      </motion.button>
    );
  }

  return (
    <>
      {/* Trigger buttons */}
      <div className="mt-4! flex! flex-col! gap-2.5!">
        <button
          onClick={() => openIntent("enquire")}
          className="w-full! bg-[#27427f]! text-white! font-manrope! font-normal! text-base! py-3! rounded-xl! hover:bg-[#1e3366]! transition-all! flex! items-center! justify-center! gap-2! cursor-pointer!"
        >
          <Phone className="w-4! h-4!" />
          Enquire Now
        </button>
        <button
          onClick={() => openIntent("visit")}
          className="w-full! bg-white! text-[#27427f]! font-manrope! border! border-[#27427f]/25! hover:bg-[#27427f]/5! font-normal! text-base! py-3! rounded-xl! transition-all! flex! items-center! justify-center! gap-2! cursor-pointer!"
        >
          <Calendar className="w-4! h-4!" />
          Schedule Visit
        </button>
      </div>

      {/* Auth modal */}
      <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── Enquiry dialog ── */}
      <AnimatePresence>
        {dialog === "enquire" && (
          <DialogShell id="enquire" eyebrow="Property Enquiry">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <SuccessState message="We will contact you shortly." />
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }} className="space-y-[14px]!">
                  <ContactCard />

                  {status === "error" && errorMsg && (
                    <p className="text-[13px]! text-red-600!">{errorMsg}</p>
                  )}

                  <SubmitBtn label="Submit Enquiry" onClick={() => handleSubmit("enquiry")} />
                </motion.div>
              )}
            </AnimatePresence>
          </DialogShell>
        )}
      </AnimatePresence>

      {/* ── Visit dialog ── */}
      <AnimatePresence>
        {dialog === "visit" && (
          <DialogShell id="visit" eyebrow="Schedule a Site Visit">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <SuccessState message="Your site visit is booked. We will confirm shortly." />
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }} className="space-y-[14px]!">
                  <ContactCard />

                  {/* Date */}
                  <div>
                    <label className={labelClass}>Preferred Date</label>
                    <input
                      type="date"
                      min={todayYmd()}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Time slot grid */}
                  <div>
                    <label className={labelClass}>Preferred Time</label>
                    <div className="grid! grid-cols-4! gap-2!">
                      {VISIT_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setVisitSlot(slot)}
                          className={
                            "py-2! text-[12px]! rounded-lg! border! transition-colors! " +
                            (visitSlot === slot
                              ? "bg-[#27427f]! text-white! border-[#27427f]!"
                              : "bg-white! text-gray-700! border-gray-300! hover:border-[#27427f]!")
                          }
                        >
                          {formatSlot(slot)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {status === "error" && errorMsg && (
                    <p className="text-[13px]! text-red-600!">{errorMsg}</p>
                  )}

                  <SubmitBtn label="Book Visit" onClick={() => handleSubmit("site_visit")} />
                </motion.div>
              )}
            </AnimatePresence>
          </DialogShell>
        )}
      </AnimatePresence>
    </>
  );
}
