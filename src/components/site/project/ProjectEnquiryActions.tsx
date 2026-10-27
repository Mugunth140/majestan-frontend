"use client";

import { inventoryAvailability } from "@/lib/inventory-availability";
import { InventoryAvailabilityNotice } from "@/components/site/shared/InventoryAvailabilityNotice";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Phone } from "lucide-react";
import { UserAuthModal } from "@/components/site/auth/user-auth-modal";
import { useUserAuthStore } from "@/store/userAuthStore";
import { createProjectEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { isValidVisitDate } from "@/lib/visit-slots";
import { LISTING_ENQUIRY_BUTTON, LISTING_VISIT_BUTTON } from "@/components/site/shared/listing-summary-styles";
import { ProjectDialogShell, VisitPicker, firstBookableDate } from "@/components/site/project/ProjectEnquiryDialog";
import {
  ContactCard,
  ContactDetailsSection,
  SuccessState,
  SubmitBtn,
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
  status?: string;
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
  const resumingExpiredSession = useRef(false);
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
  const [visitDate, setVisitDate] = useState(firstBookableDate);
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
    setVisitDate(firstBookableDate());
    setMessage(withMessage ?? "");
    setDialog(which);
  }

  /** Flips the open dialog between enquiry and visit, keeping the contact details. */
  function switchIntent(which: Intent) {
    setStatus("idle");
    setErrorMsg("");
    setDialog(which);
  }

  // After OTP login, resume the pending intent (with its event message)
  useEffect(() => {
    if (isAuthenticated && pendingIntent) {
      if (!resumingExpiredSession.current) seedFromUser();
      setStatus("idle");
      setErrorMsg("");
      if (!resumingExpiredSession.current) {
        setVisitSlot("");
        setVisitDate(firstBookableDate());
        setMessage(pendingMessage);
      }
      resumingExpiredSession.current = false;
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
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && error.status === 401) {
        resumingExpiredSession.current = true;
        useUserAuthStore.getState().logout();
        setDialog(null);
        setPendingIntent(intent === "site_visit" ? "visit" : "enquire");
        setAuthOpen(true);
        setStatus("idle");
        return;
      }
      const detail = error && typeof error === "object" && "status" in error &&
        typeof error.status === "number" && error.status < 500 && error instanceof Error
        ? error.message : "We could not submit your request. Please try again.";
      setErrorMsg(detail);
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

  if (inventoryAvailability(project.status)) return hideTriggers ? null : <InventoryAvailabilityNotice status={project.status} />;

  return (
    <>
      {/* Trigger buttons */}
      {!hideTriggers && (
      <div data-enquiry-actions className="mt-4! flex! flex-col! gap-2.5!">
        <button
          onClick={() => openIntent("enquire")}
          className={LISTING_ENQUIRY_BUTTON}
        >
          <Phone className="w-4! h-4!" />
          Enquire Now
        </button>
        <button
          onClick={() => openIntent("visit")}
          className={LISTING_VISIT_BUTTON}
        >
          <Calendar className="w-4! h-4!" />
          Schedule Visit
        </button>
      </div>
      )}

      {/* Auth modal */}
      <UserAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── One dialog for both intents: the switch inside flips the form
          without closing and reopening the sheet. ── */}
      <AnimatePresence>
        {dialog && (
          <ProjectDialogShell
            id="project-enquiry"
            intent={dialog}
            projectName={project.name}
            city={project.city}
            onClose={closeDialog}
            onSwitch={status === "success" ? undefined : switchIntent}
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <SuccessState
                  name={name}
                  message={dialog === "visit" ? "Your site visit is booked. We will confirm shortly." : "We will contact you shortly."}
                />
              ) : dialog === "enquire" ? (
                <motion.div
                  key="enquire"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-[14px]!"
                >
                  {contactCard}

                  {status === "error" && errorMsg && (
                    <p className="text-[13px]! text-red-600!">{errorMsg}</p>
                  )}

                  <SubmitBtn label="Submit Enquiry" onClick={() => handleSubmit("enquiry")} submitting={status === "submitting"} />
                </motion.div>
              ) : (
                <motion.div
                  key="visit"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-[14px]!"
                >
                  {contactCardCollapsed}

                  <VisitPicker
                    date={visitDate}
                    slot={visitSlot}
                    onDate={(value) => {
                      setVisitDate(value);
                      setVisitSlot("");
                    }}
                    onSlot={setVisitSlot}
                  />

                  {status === "error" && errorMsg && (
                    <p className="text-[13px]! text-red-600!">{errorMsg}</p>
                  )}

                  <SubmitBtn label="Book Visit" onClick={() => handleSubmit("site_visit")} submitting={status === "submitting"} />
                </motion.div>
              )}
            </AnimatePresence>
          </ProjectDialogShell>
        )}
      </AnimatePresence>
    </>
  );
}
