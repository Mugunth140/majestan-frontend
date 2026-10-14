"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Phone } from "lucide-react";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { useUserAuthStore } from "@/store/userAuthStore";
import { createProjectEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { VISIT_SLOTS, formatSlot, isValidVisitDate, maxVisitDate, todayYmd } from "@/lib/visit-slots";
import {
  ContactCard,
  ContactDetailsSection,
  DialogShell,
  SuccessState,
  SubmitBtn,
  inputClass,
  labelClass,
  type EnquiryIntent,
} from "@/components/site/property/PropertyEnquiryActions";
import {
  PROJECT_ENQUIRE_EVENT,
  type ProjectEnquireDetail,
} from "@/components/site/project/enquiry-events";

/** Minimal project identity. Accepts ProjectDetail and ProjectListItem as-is. */
export type EnquiryProjectRef = {
  id: number;
  projectCode: string | null;
  slug: string | null;
  name: string;
  projectType: string;
  city: string;
};

type Intent = EnquiryIntent;
type Status = "idle" | "submitting" | "success" | "error";

/** The backend sets this placeholder for OTP-login users who skipped name entry. */
const PLACEHOLDER_NAME = "Majestan User";

function isRealName(name: string | undefined | null): boolean {
  return !!name && name.trim().length > 0 && name.trim() !== PLACEHOLDER_NAME;
}

/** The backend synthesises fake emails for OTP-only users; don't send those. */
function isRealEmail(email: string | undefined | null): boolean {
  if (!email || !email.includes("@")) return false;
  const lower = email.toLowerCase();
  return !lower.endsWith("@user.majestan.local") && !lower.endsWith("@majestan.local");
}

interface ProjectEnquiryActionsProps {
  project: EnquiryProjectRef;
  /** Hide the island's own trigger buttons (parent opens the dialog). */
  hideTriggers?: boolean;
  /**
   * External open request. Parent sets a fresh `{ intent, token }` object per
   * click; the island opens that dialog. Used by listing cards that keep
   * their own styled Enquire button.
   */
  externalOpen?: { intent: EnquiryIntent; token: number } | null;
}

export function ProjectEnquiryActions({ project, hideTriggers, externalOpen }: ProjectEnquiryActionsProps) {
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

  // Event-provided note (e.g. from RequestButton). No visible textarea —
  // parity with the property dialog — but still sent in the payload.
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");

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

  function openIntent(which: Intent, withMessage?: string) {
    if (!useUserAuthStore.getState().isAuthenticated) {
      setPendingIntent(which);
      setPendingMessage(withMessage ?? "");
      setAuthOpen(true);
      return;
    }
    seedFromUser();
    setStatus("idle");
    setErrorMsg("");
    setVisitSlot("");
    setVisitDate(todayYmd());
    setMessage(withMessage ?? "");
    setDialog(which);
  }

  // After OTP login, resume the pending intent (with its event message)
  useEffect(() => {
    if (isAuthenticated && pendingIntent) {
      seedFromUser();
      setStatus("idle");
      setErrorMsg("");
      setVisitSlot("");
      setVisitDate(todayYmd());
      setMessage(pendingMessage);
      setDialog(pendingIntent);
      setPendingIntent(null);
      setPendingMessage("");
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

  // Sections elsewhere on the page open this same form with a pre-filled
  // note (see enquiry-events.ts). Reads auth state imperatively so the
  // once-subscribed handler never goes stale.
  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<ProjectEnquireDetail>).detail ?? {};
      openIntent(detail.intent ?? "enquire", detail.message ?? "");
    };
    window.addEventListener(PROJECT_ENQUIRE_EVENT, onRequest);
    return () => window.removeEventListener(PROJECT_ENQUIRE_EVENT, onRequest);
    // intentional: subscribe once (openIntent reads auth store imperatively)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External open request from a parent with its own trigger button.
  // Each click carries a fresh token, so repeated clicks re-open reliably.
  const externalToken = externalOpen?.token;
  const externalIntent = externalOpen?.intent;
  useEffect(() => {
    if (externalToken != null && externalIntent) {
      openIntent(externalIntent);
    }
    // intentional: fire only when the parent issues a new token, not on
    // every render (openIntent reads auth store imperatively)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalToken]);

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
    if (!token) {
      setErrorMsg("Please log in again before submitting.");
      setStatus("error");
      return;
    }
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
      await createProjectEnquiry(
        {
          projectId: project.id,
          projectCode: project.projectCode,
          slug: project.slug,
          name: trimmedName,
          phone: normalized,
          ...(isRealEmail(authedUser?.email) ? { email: authedUser!.email } : {}),
          ...(message.trim() ? { message: message.trim() } : {}),
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

  const contactCard = (
    <ContactCard
      name={name}
      setName={setName}
      editingName={editingName}
      setEditingName={setEditingName}
      nameInputRef={nameInputRef}
      displayPhone={displayPhone()}
      email={authedUser?.email}
    />
  );

  // Collapsible contact for the visit dialog, where date and slots come
  // first. Summary keeps name and phone visible while collapsed.
  const contactSummary = [name.trim(), displayPhone()].filter(Boolean).join(" · ");
  const contactCardCollapsed = (
    <ContactDetailsSection
      summary={contactSummary || "Add your contact details"}
      defaultOpen={!(isRealName(name) && displayPhone())}
      alertOpen={editingName}
    >
      <ContactCard
        name={name}
        setName={setName}
        editingName={editingName}
        setEditingName={setEditingName}
        nameInputRef={nameInputRef}
        displayPhone={displayPhone()}
        email={authedUser?.email}
        bare
      />
    </ContactDetailsSection>
  );

  return (
    <>
      {/* Trigger buttons */}
      {!hideTriggers && (
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
      )}

      {/* Auth modal */}
      <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── Enquiry dialog ── */}
      <AnimatePresence>
        {dialog === "enquire" && (
          <DialogShell id="enquire" eyebrow="Project Enquiry" title={project.name} onClose={closeDialog}>
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <SuccessState name={name} message="We will contact you shortly." />
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }} className="space-y-[14px]!">
                  {contactCard}

                  {status === "error" && errorMsg && (
                    <p className="text-[13px]! text-red-600!">{errorMsg}</p>
                  )}

                  <SubmitBtn label="Submit Enquiry" onClick={() => handleSubmit("enquiry")} submitting={status === "submitting"} />
                </motion.div>
              )}
            </AnimatePresence>
          </DialogShell>
        )}
      </AnimatePresence>

      {/* ── Visit dialog ── */}
      <AnimatePresence>
        {dialog === "visit" && (
          <DialogShell id="visit" eyebrow="Schedule a Site Visit" title={project.name} onClose={closeDialog}>
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <SuccessState name={name} message="Your site visit is booked. We will confirm shortly." />
              ) : (
                <motion.div key="form" exit={{ opacity: 0 }} className="space-y-[14px]!">
                  {contactCardCollapsed}

                  {/* Date */}
                  <div>
                    <label className={labelClass}>Preferred Date</label>
                      <input
                        type="date"
                        min={todayYmd()}
                        max={maxVisitDate()}
                        value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                    {/* Time slot pills, finance-picker style: outline pills,
                        selected turns bright-blue gradient. */}
                    <div>
                      <label className={labelClass}>Preferred Time</label>
                      <div className="grid! grid-cols-4! gap-2!">
                        {VISIT_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setVisitSlot(slot)}
                            aria-pressed={visitSlot === slot}
                            className={
                              "py-2! px-1! text-[12px]! font-medium! rounded-full! border! transition-colors! whitespace-nowrap! " +
                              (visitSlot === slot
                                ? "bg-[linear-gradient(115deg,#2563eb,#1645bf)]! text-white! border-[#2563eb]!"
                                : "bg-white! text-gray-700! border-[#dae4f3]! hover:border-[#2563eb]!")
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

                  <SubmitBtn label="Book Visit" onClick={() => handleSubmit("site_visit")} submitting={status === "submitting"} />
                </motion.div>
              )}
            </AnimatePresence>
          </DialogShell>
        )}
      </AnimatePresence>
    </>
  );
}
