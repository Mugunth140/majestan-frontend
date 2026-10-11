"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Phone,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { usePrefersReducedMotion } from "@/components/site/shared/use-prefers-reduced-motion";
import {
  VISIT_SLOTS,
  formatSlot,
  isValidVisitDate,
  maxVisitDate,
  todayYmd,
} from "@/lib/visit-slots";
import { projectTypeLabel } from "@/lib/project-overview";
import type { ProjectDetail } from "@/lib/api/projects";
import {
  PROJECT_ENQUIRE_EVENT,
  type ProjectEnquireDetail,
} from "@/components/site/project/enquiry-events";

type Intent = "enquire" | "visit";
type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = { name?: string; phone?: string; date?: string; slot?: string };

/**
 * Project enquiry and site-visit capture.
 *
 * The buttons on the old overview had no handler at all — the primary action
 * of a lead-generation page did nothing when clicked. This posts to the public
 * `POST /leads/enquiry` endpoint rather than `/leads/property-enquiry`: the
 * latter takes a `propertyId` foreign key, and passing a project id to it
 * would file the lead against an unrelated property. The generic endpoint
 * carries the project identity in `message` and `pageUrl` instead, and needs
 * no signed-in session, so there is no OTP wall in front of an enquiry.
 */
export function ProjectEnquiryActions({ project }: { project: ProjectDetail }) {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [visitDate, setVisitDate] = useState(todayYmd());
  const [visitSlot, setVisitSlot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const isVisit = intent === "visit";

  function open(which: Intent) {
    setIntent(which);
    setStatus("idle");
    setErrors({});
    setErrorMsg("");
    setVisitDate(todayYmd());
    setVisitSlot("");
  }

  function close() {
    setIntent(null);
  }

  // Sections elsewhere on the page open this same form with a pre-filled
  // note (see enquiry-events.ts). Only state setters are touched, and those
  // are stable, so subscribing once is safe.
  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<ProjectEnquireDetail>).detail ?? {};
      setIntent(detail.intent ?? "enquire");
      setStatus("idle");
      setErrors({});
      setErrorMsg("");
      setVisitDate(todayYmd());
      setVisitSlot("");
      setMessage(detail.message ?? "");
    };
    window.addEventListener(PROJECT_ENQUIRE_EVENT, onRequest);
    return () => window.removeEventListener(PROJECT_ENQUIRE_EVENT, onRequest);
  }, []);

  // Escape to dismiss, and hold the page still behind the dialog.
  useEffect(() => {
    if (!intent) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [intent]);

  function validate(field: keyof FieldErrors): string | undefined {
    if (field === "name") {
      return name.trim().length < 2 ? "Please tell us your name." : undefined;
    }
    if (field === "phone") {
      return normalizeIndianPhone(phone)
        ? undefined
        : "Enter a valid 10 digit Indian mobile number.";
    }
    if (field === "date") {
      if (!isVisit) return undefined;
      return isValidVisitDate(visitDate)
        ? undefined
        : "Pick a date within the next three months.";
    }
    if (field === "slot") {
      if (!isVisit) return undefined;
      return visitSlot ? undefined : "Choose a time that suits you.";
    }
    return undefined;
  }

  const onBlur = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: validate(field) }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: FieldErrors = {
      name: validate("name"),
      phone: validate("phone"),
      date: validate("date"),
      slot: validate("slot"),
    };
    setErrors(next);
    if (next.name || next.phone || next.date || next.slot) return;

    setStatus("submitting");
    setErrorMsg("");

    const identity = [project.name, project.projectCode]
      .filter(Boolean)
      .join(" · ");
    const intro = isVisit
      ? `Site visit request for ${identity} on ${visitDate} at ${formatSlot(visitSlot)}.`
      : `Enquiry about ${identity}.`;

    try {
      await createEnquiry({
        name: name.trim(),
        phone: normalizeIndianPhone(phone) ?? phone.trim(),
        propertyType: project.projectType,
        listingType: "Sell",
        location: [project.sublocation, project.city].filter(Boolean).join(", "),
        message: message.trim() ? `${intro}\n\n${message.trim()}` : intro,
        source: isVisit ? "project_site_visit" : "project_enquiry",
        pageUrl: typeof window === "undefined" ? undefined : window.location.href,
      });
      setStatus("success");
    } catch {
      setErrorMsg("We could not send that. Please try again, or call us directly.");
      setStatus("error");
    }
  }

  return (
    <>
      <div className="flex! flex-col! gap-2!">
        <button
          type="button"
          onClick={() => open("enquire")}
          className="w-full! inline-flex! items-center! justify-center! gap-2! rounded-xl! bg-[#27427f]! px-4! py-3! text-base! font-semibold! text-white! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#1e3563]! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
        >
          <Phone className="w-4! h-4!" />
          Enquire now
        </button>
        <button
          type="button"
          onClick={() => open("visit")}
          className="w-full! inline-flex! items-center! justify-center! gap-2! rounded-xl! bg-white! px-4! py-3! text-base! font-semibold! text-[#27427f]! ring-1! ring-[#27427f]/25! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#27427f]/5! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
        >
          <CalendarDays className="w-4! h-4!" />
          Schedule a visit
        </button>
      </div>

      <AnimatePresence>
        {intent && (
          <motion.div
            key="backdrop"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15, ease: [0.23, 1, 0.32, 1] }}
            onClick={close}
            className="fixed! inset-0! z-[100]! bg-gray-900/55! backdrop-blur-sm! flex! items-end! sm:items-center! justify-center! p-0! sm:p-4!"
          >
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-enquiry-title"
              onClick={(event) => event.stopPropagation()}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              // Exit is faster than entry: once dismissed, the dialog is in the
              // way of whatever the person wants to look at next.
              exit={{ opacity: 0, scale: 0.98, transition: { duration: reduceMotion ? 0 : 0.12 } }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative! w-full! sm:max-w-md! max-h-[92vh]! overflow-y-auto! bg-white! rounded-t-3xl! sm:rounded-3xl! p-6!"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute! top-4! right-4! grid! place-items-center! h-8! w-8! rounded-lg! text-gray-500! cursor-pointer! transition-colors! duration-150! ease-out-quint! hover:bg-gray-100! hover:text-gray-900! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
              >
                <X className="w-4! h-4!" />
              </button>

              {status === "success" ? (
                <div className="pt-2! pb-2! flex! flex-col! items-start! gap-3!">
                  <CheckCircle2 className="w-6! h-6! text-emerald-600!" />
                  <h2
                    id="project-enquiry-title"
                    className="text-xl! font-semibold! text-gray-900! tracking-tight!"
                  >
                    {isVisit ? "Your visit is requested" : "We have your enquiry"}
                  </h2>
                  <p className="text-sm! leading-relaxed! text-gray-600!">
                    {isVisit
                      ? `Our team will confirm ${formatSlot(visitSlot)} on ${visitDate} for ${project.name} by phone.`
                      : `Our team will call you back about ${project.name} shortly.`}
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-2! inline-flex! items-center! justify-center! rounded-xl! bg-[#27427f]! px-4! py-2! text-sm! font-semibold! text-white! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#1e3563]! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="pr-8!">
                  <h2
                    id="project-enquiry-title"
                    className="text-xl! font-semibold! text-gray-900! tracking-tight!"
                  >
                    {isVisit ? "Schedule a visit" : "Enquire about this project"}
                  </h2>
                  <p className="mt-1! text-sm! text-gray-600!">
                    {project.name} ·{" "}
                    {[project.sublocation, project.city].filter(Boolean).join(", ")}
                  </p>

                  <div className="mt-5! flex! flex-col! gap-4!">
                    <Field
                      id="project-enquiry-name"
                      label="Name"
                      error={errors.name}
                    >
                      <input
                        ref={firstFieldRef}
                        id="project-enquiry-name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onBlur={() => onBlur("name")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "project-enquiry-name-error" : undefined}
                        placeholder="Your name"
                        className={fieldClass}
                      />
                    </Field>

                    <Field
                      id="project-enquiry-phone"
                      label="Mobile number"
                      error={errors.phone}
                    >
                      <input
                        id="project-enquiry-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        onBlur={() => onBlur("phone")}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "project-enquiry-phone-error" : undefined}
                        placeholder="10 digit mobile number"
                        className={fieldClass}
                      />
                    </Field>

                    {isVisit && (
                      <div className="grid! grid-cols-2! gap-3!">
                        <Field
                          id="project-enquiry-date"
                          label="Date"
                          error={errors.date}
                        >
                          <input
                            id="project-enquiry-date"
                            type="date"
                            value={visitDate}
                            min={todayYmd()}
                            max={maxVisitDate()}
                            onChange={(event) => setVisitDate(event.target.value)}
                            onBlur={() => onBlur("date")}
                            aria-invalid={Boolean(errors.date)}
                            aria-describedby={errors.date ? "project-enquiry-date-error" : undefined}
                            className={fieldClass}
                          />
                        </Field>
                        <Field
                          id="project-enquiry-slot"
                          label="Time"
                          error={errors.slot}
                        >
                          <select
                            id="project-enquiry-slot"
                            value={visitSlot}
                            onChange={(event) => setVisitSlot(event.target.value)}
                            onBlur={() => onBlur("slot")}
                            aria-invalid={Boolean(errors.slot)}
                            aria-describedby={errors.slot ? "project-enquiry-slot-error" : undefined}
                            className={fieldClass}
                          >
                            <option value="">Select</option>
                            {VISIT_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {formatSlot(slot)}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    )}

                    <Field
                      id="project-enquiry-message"
                      label="Anything specific? (optional)"
                    >
                      <textarea
                        id="project-enquiry-message"
                        rows={3}
                        /* CreateEnquiryDto caps `message` at 2000 and the
                           prefix below adds ~120, so an unbounded textarea
                           turns a long note into a 400 at submit time. */
                        maxLength={1800}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={
                          project.projectType === "plot"
                            ? "e.g. looking for a corner plot, east facing"
                            : `e.g. interested in a ${projectTypeLabel(project.projectType).toLowerCase()} on a higher floor`
                        }
                        className={`${fieldClass} resize-none!`}
                      />
                    </Field>
                  </div>

                  {errorMsg && (
                    <p
                      role="alert"
                      className="mt-4! flex! items-start! gap-2! text-xs! text-red-600!"
                    >
                      <TriangleAlert className="w-4! h-4! shrink-0!" />
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-5! w-full! inline-flex! items-center! justify-center! gap-2! rounded-xl! bg-[#27427f]! px-4! py-3! text-base! font-semibold! text-white! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#1e3563]! active:scale-[0.98]! disabled:opacity-60! disabled:pointer-events-none! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-4! h-4! animate-spin!" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="w-4! h-4!" />
                        {isVisit ? "Request this slot" : "Send enquiry"}
                      </>
                    )}
                  </button>

                  <p className="mt-3! text-xs! leading-relaxed! text-gray-500!">
                    We use your number only to respond to this enquiry.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const fieldClass =
  "w-full! px-3! py-2.5! rounded-xl! bg-white! border! border-gray-300! text-sm! text-gray-900! " +
  "outline-none! transition-colors! duration-150! ease-out-quint! placeholder:text-gray-400! " +
  "focus:border-[#27427f]! focus-visible:ring-2! focus-visible:ring-[#27427f]/20! " +
  "aria-[invalid=true]:border-red-400!";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block! text-xs! font-medium! text-gray-600! mb-1!"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1! text-xs! text-red-600!">
          {error}
        </p>
      )}
    </div>
  );
}
