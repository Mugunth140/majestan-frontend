"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Phone, X, Loader2, CheckCircle2 } from "lucide-react";
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

export function PropertyEnquiryActions({ property }: PropertyEnquiryActionsProps) {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const authedUser = useUserAuthStore((s) => s.user);
  const token = useUserAuthStore((s) => s.token);

  const [authOpen, setAuthOpen] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null);
  const [dialog, setDialog] = useState<Intent | null>(null);

  // Enquiry form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Visit form state
  const [visitDate, setVisitDate] = useState(todayYmd());
  const [visitSlot, setVisitSlot] = useState("");

  // Shared status
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function seedFormFromUser() {
    if (authedUser) {
      setName(authedUser.name || "");
      setPhone(authedUser.phone || "");
      setEmail(authedUser.email || "");
    }
  }

  function openIntent(which: Intent) {
    if (!isAuthenticated) {
      setPendingIntent(which);
      setAuthOpen(true);
      return;
    }
    seedFormFromUser();
    setStatus("idle");
    setErrorMsg("");
    setVisitSlot("");
    setVisitDate(todayYmd());
    setDialog(which);
  }

  // After OTP login completes, UserAuthModal calls login() then onClose()
  // so isAuthenticated flips — resume pending intent here.
  useEffect(() => {
    if (isAuthenticated && pendingIntent) {
      seedFormFromUser();
      setStatus("idle");
      setErrorMsg("");
      setVisitSlot("");
      setVisitDate(todayYmd());
      setDialog(pendingIntent);
      setPendingIntent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pendingIntent]);

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
  }

  async function submitEnquiry() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMsg("Please enter your full name.");
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
      await createPropertyEnquiry(
        {
          propertyId: property.id,
          propertyCode: property.propertyCode,
          slug: property.slug,
          name: trimmedName,
          email: email || undefined,
          phone: normalized,
          message: message || undefined,
          intent: "enquiry",
        },
        token!,
      );
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  async function submitVisit() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMsg("Please enter your full name.");
      setStatus("error");
      return;
    }
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      setStatus("error");
      return;
    }
    if (!isValidVisitDate(visitDate) || !visitSlot) {
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
          email: email || undefined,
          phone: normalized,
          message: message || undefined,
          intent: "site_visit",
          visitDate,
          visitSlot,
        },
        token!,
      );
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full! px-[13px]! py-[10px]! rounded-[10px]! bg-white! border! border-gray-300! " +
    "text-[14px]! text-[#161e2d]! outline-none! transition-colors! duration-150! " +
    "placeholder:text-gray-400! focus:border-[#27427f]!";

  const labelClass = "block! text-[12px]! text-gray-600! mb-[6px]!";

  return (
    <>
      {/* Trigger buttons — match sidebar exact classNames */}
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

      {/* Auth modal — shows OTP login when not authenticated */}
      <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Dialogs */}
      <AnimatePresence>
        {dialog === "enquire" && (
          <motion.div
            key="enquire-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            role="presentation"
            onClick={closeDialog}
            className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! bg-gray-900/40! backdrop-blur-sm! p-4!"
          >
            <motion.div
              key="enquire-card"
              initial={{ opacity: 0, y: 52, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="enquire-title"
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

              <div className="mb-6!">
                <span className="block! mb-1.5! text-[10px]! font-semibold! uppercase! tracking-[0.14em]! text-[#27427f]!">
                  Property Enquiry
                </span>
                <h4 id="enquire-title" className="pr-8! text-[20px]! font-semibold! leading-snug! tracking-tight! text-[#161e2d]!">
                  {property.title}
                </h4>
              </div>

              <AnimatePresence mode="wait">
                {status === "success" ? (
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
                    <p className="mt-[5px]! text-[14px]! leading-[1.6]! text-gray-600!">
                      We will contact you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }} className="space-y-[15px]!">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arjun Selvam"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98400 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Message</label>
                      <textarea
                        placeholder="Tell us about your requirements..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className={inputClass + " resize-none!"}
                      />
                    </div>

                    {status === "error" && errorMsg && (
                      <p className="text-[13px]! text-red-600!">{errorMsg}</p>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      type="button"
                      disabled={status === "submitting"}
                      onClick={submitEnquiry}
                      className="w-full! bg-[#27427f]! text-white! font-manrope! font-semibold! text-[15px]! py-3! rounded-xl! hover:bg-[#1e3366]! transition-all! flex! items-center! justify-center! gap-2! disabled:opacity-70! disabled:cursor-not-allowed!"
                    >
                      {status === "submitting" ? (
                        <Loader2 size={20} className="animate-spin!" />
                      ) : (
                        "Submit Enquiry"
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dialog === "visit" && (
          <motion.div
            key="visit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            role="presentation"
            onClick={closeDialog}
            className="fixed! inset-0! z-50! flex! items-end! sm:items-center! justify-center! bg-gray-900/40! backdrop-blur-sm! p-4!"
          >
            <motion.div
              key="visit-card"
              initial={{ opacity: 0, y: 52, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="visit-title"
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

              <div className="mb-6!">
                <span className="block! mb-1.5! text-[10px]! font-semibold! uppercase! tracking-[0.14em]! text-[#27427f]!">
                  Schedule a Site Visit
                </span>
                <h4 id="visit-title" className="pr-8! text-[20px]! font-semibold! leading-snug! tracking-tight! text-[#161e2d]!">
                  {property.title}
                </h4>
              </div>

              <AnimatePresence mode="wait">
                {status === "success" ? (
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
                    <p className="mt-[5px]! text-[14px]! leading-[1.6]! text-gray-600!">
                      Your site visit is booked. We will confirm shortly.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }} className="space-y-[15px]!">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arjun Selvam"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98400 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Preferred Date *</label>
                      <input
                        type="date"
                        min={todayYmd()}
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Preferred Time *</label>
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

                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      type="button"
                      disabled={status === "submitting"}
                      onClick={submitVisit}
                      className="w-full! bg-[#27427f]! text-white! font-manrope! font-semibold! text-[15px]! py-3! rounded-xl! hover:bg-[#1e3366]! transition-all! flex! items-center! justify-center! gap-2! disabled:opacity-70! disabled:cursor-not-allowed!"
                    >
                      {status === "submitting" ? (
                        <Loader2 size={20} className="animate-spin!" />
                      ) : (
                        "Book Visit"
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
