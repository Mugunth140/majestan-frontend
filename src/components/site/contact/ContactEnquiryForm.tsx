"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { FORM } from "./content";
import { usePrefersReducedMotion } from "@/components/site/shared/use-prefers-reduced-motion";

type Status = "idle" | "submitting" | "success" | "error";
type Field = "name" | "email" | "phone" | "message";
type FieldErrors = Partial<Record<Field, string>>;

const SETTLE_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldClass =
  "w-full! px-[13px]! py-[10px]! rounded-[10px]! bg-white! border! border-gray-300! " +
  "text-[14px]! text-[#161e2d]! outline-none! transition-colors! duration-150! " +
  "placeholder:text-gray-400! focus:border-[#27427f]!";

const labelClass = "block! text-[12px]! text-gray-600! mb-[6px]!";

export function ContactEnquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState("");
  const reduceMotion = usePrefersReducedMotion();

  const validate = (field: Field): string | undefined => {
    if (field === "name") {
      return name.trim().length < 2 ? "Please tell us your name." : undefined;
    }
    if (field === "email") {
      return !EMAIL_PATTERN.test(email.trim())
        ? "Enter a valid email address."
        : undefined;
    }
    if (field === "phone") {
      return normalizeIndianPhone(phone)
        ? undefined
        : "Enter a valid 10-digit Indian mobile number.";
    }
    return message.trim().length < 10
      ? "A sentence or two helps us route this to the right person."
      : undefined;
  };

  const onBlur = (field: Field) =>
    setErrors((prev) => ({ ...prev, [field]: validate(field) }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const next: FieldErrors = {
      name: validate("name"),
      email: validate("email"),
      phone: validate("phone"),
      message: validate("message"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      await createEnquiry({
        name: name.trim(),
        email: email.trim(),
        phone: normalizeIndianPhone(phone) ?? phone.trim(),
        // The API takes one free-text field, so the subject and the message are
        // combined rather than dropping either. Keeps the topic visible to sales
        // without needing a schema change.
        message: subject ? `[${subject}] ${message.trim()}` : message.trim(),
        source: "contact_page",
        pageUrl: typeof window === "undefined" ? undefined : window.location.href,
      });
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      setErrorMsg(
        "That message did not send. Please try again, or call us on +91 90929 65556.",
      );
      setStatus("error");
    }
  }

  return (
    <div>
      <h2 className="text-[clamp(21px,2.4vw,26px)]! font-medium! text-[#161e2d]! leading-[1.18]! tracking-[-0.018em]!">
        {FORM.title}
      </h2>
      <p className="mt-[8px]! max-w-[46ch]! text-[14px]! leading-[1.6]! text-gray-500!">
        {FORM.description}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : SETTLE_SPRING}
            className="mt-[26px]! flex! items-start! gap-3!"
            role="status"
          >
            <CheckCircle2
              className="w-[20px]! h-[20px]! text-emerald-600! shrink-0! mt-[2px]!"
              aria-hidden="true"
            />
            <div>
              <p className="text-[15px]! font-medium! text-[#161e2d]!">{FORM.successTitle}</p>
              <p className="mt-[5px]! max-w-[42ch]! text-[14px]! leading-[1.6]! text-gray-600!">
                {FORM.successBody}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : SETTLE_SPRING}
            className="mt-[24px]! space-y-[15px]!"
          >
            <div className="grid! grid-cols-1! sm:grid-cols-2! gap-x-4! gap-y-[15px]!">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Full name *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onBlur={() => onBlur("name")}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  placeholder="Your name"
                  className={fieldClass}
                />
                {errors.name && (
                  <p id="contact-name-error" className="mt-[5px]! text-[12px]! text-red-600!">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-phone" className={labelClass}>
                  Phone *
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  onBlur={() => onBlur("phone")}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                  placeholder="10-digit mobile number"
                  className={fieldClass}
                />
                {errors.phone && (
                  <p id="contact-phone-error" className="mt-[5px]! text-[12px]! text-red-600!">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => onBlur("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                placeholder="you@example.com"
                className={fieldClass}
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-[5px]! text-[12px]! text-red-600!">
                  {errors.email}
                </p>
              )}
            </div>

            <fieldset>
              <legend className={labelClass}>
                What is this about? <span className="text-gray-400!">(optional)</span>
              </legend>
              {/*
                A radio group rather than a <select>. The legacy theme ships a
                global `select { display: none !important }` and expects bespoke
                `.dropdown-select` markup, so a native select renders as a 0x0
                element here. Real radios need no override of that `!important`,
                are keyboard-navigable for free, and let the topic be one click.
              */}
              <div className="grid! grid-cols-1! sm:grid-cols-2! gap-x-4! gap-y-1!">
                {FORM.subjects.map((option) => (
                  <label
                    key={option}
                    className="group flex! items-center! gap-2.5! py-[7px]! text-[14px]! text-gray-700! cursor-pointer! transition-colors! duration-150! hover:text-[#161e2d]!"
                  >
                    <input
                      type="radio"
                      name="subject"
                      value={option}
                      checked={subject === option}
                      onChange={(event) => setSubject(event.target.value)}
                      className="peer sr-only!"
                    />
                    <span
                      aria-hidden="true"
                      className="flex! shrink-0! items-center! justify-center! w-[15px]! h-[15px]! rounded-full! border! border-gray-300! transition-colors! duration-150! peer-checked:border-[#27427f]! peer-focus-visible:ring-2! peer-focus-visible:ring-[#27427f]/40! peer-focus-visible:ring-offset-2!"
                    >
                      {subject === option && (
                        <span className="w-[7px]! h-[7px]! rounded-full! bg-[#27427f]" />
                      )}
                    </span>
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message *
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onBlur={() => onBlur("message")}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                placeholder="Tell us about the property or the question you have."
                className={`${fieldClass} resize-y!`}
              />
              {errors.message && (
                <p id="contact-message-error" className="mt-[5px]! text-[12px]! text-red-600!">
                  {errors.message}
                </p>
              )}
            </div>

            {errorMsg && (
              <p
                className="flex! items-start! gap-2! text-[13px]! text-red-600!"
                role="alert"
              >
                <TriangleAlert className="w-[15px]! h-[15px]! shrink-0! mt-[2px]!" aria-hidden="true" />
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex! items-center! justify-center! gap-2! rounded-[10px]! bg-[#27427f]! px-[20px]! py-[11px]! text-[13px]! font-medium! text-white! transition-colors! duration-150! hover:bg-[#1e3563]! active:scale-[0.99]! disabled:opacity-60! disabled:pointer-events-none!"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-[14px]! h-[14px]! animate-spin!" aria-hidden="true" />
                  Sending
                </>
              ) : (
                FORM.submitLabel
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
