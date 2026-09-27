"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, MessageCircle, Phone, Send, TriangleAlert } from "lucide-react";

import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { CTA } from "./content";
import { usePrefersReducedMotion } from "@/components/site/shared/use-prefers-reduced-motion";
import { Reveal } from "@/components/site/shared/reveal";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Inline validation on blur, not on submit — validating while someone is still
 * typing the first field is how you end up making them fix six errors at once
 * instead of one.
 */
type FieldErrors = { name?: string; phone?: string; message?: string };

const SETTLE_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

const fieldClass =
  "w-full! px-[13px]! py-[10px]! rounded-[10px]! bg-white! border! border-gray-300! " +
  "text-[14px]! text-[#161e2d]! outline-none! transition-colors! duration-150! " +
  "placeholder:text-gray-400! focus:border-[#27427f]!";

export function LiaisoningCta() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMsg, setErrorMsg] = useState("");
  const reduceMotion = usePrefersReducedMotion();

  const validateField = (field: "name" | "phone" | "message"): string | undefined => {
    if (field === "name") {
      return name.trim().length < 2 ? "Please tell us your name." : undefined;
    }
    if (field === "phone") {
      return normalizeIndianPhone(phone)
        ? undefined
        : "Enter a valid 10-digit Indian mobile number.";
    }
    return message.trim().length < 10 ? "A sentence or two helps us route this." : undefined;
  };

  const onBlur = (field: "name" | "phone" | "message") => {
    setErrors((prev) => ({ ...prev, [field]: validateField(field) }));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      name: validateField("name"),
      phone: validateField("phone"),
      message: validateField("message"),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone || nextErrors.message) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      await createEnquiry({
        name: name.trim(),
        phone: normalizeIndianPhone(phone) ?? phone.trim(),
        message: message.trim(),
        source: "liaisoning_cta",
        pageUrl: typeof window === "undefined" ? undefined : window.location.href,
      });
      setStatus("success");
      setName("");
      setPhone("");
      setMessage("");
    } catch {
      setErrorMsg("Something went wrong sending that. Please try again, or call us directly.");
      setStatus("error");
    }
  }

  const whatsappHref = `https://wa.me/${CTA.whatsapp}?text=${encodeURIComponent(
    "Hi Majestan Realty, I'd like to discuss liaisoning support for a project in Coimbatore.",
  )}`;

  return (
    <section className="pb-[72px]! md:pb-[96px]!" aria-labelledby="cta-heading">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          {/* Light, and sitting directly on the page: no dark panel, and no
              white card holding the form inside the section. A top rule is all
              the separation it needs. */}
          <div className="border-t! border-gray-200! pt-[40px]! md:pt-[52px]!">
            <div className="grid! grid-cols-1! lg:grid-cols-[1fr_minmax(0,26rem)]! gap-8! lg:gap-16! items-start!">
              <div>
                <h2
                  id="cta-heading"
                  className="text-[clamp(23px,2.6vw,30px)]! font-medium! text-[#161e2d]! leading-[1.15]! tracking-[-0.018em]!"
                >
                  {CTA.title}
                </h2>
                <p className="mt-[12px]! max-w-[48ch]! text-[14px]! md:text-[15px]! leading-[1.65]! text-gray-600!">
                  {CTA.description}
                </p>

                <div className="mt-[22px]! flex! flex-wrap! items-center! gap-x-5! gap-y-3!">
                  <a
                    href={`tel:${CTA.phone}`}
                    className="inline-flex! items-center! gap-2! text-[14px]! text-[#161e2d]! no-underline! transition-colors! duration-150! hover:text-[#27427f]!"
                  >
                    <Phone className="w-[15px]! h-[15px]! text-gray-400!" />
                    {CTA.phoneDisplay}
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex! items-center! gap-2! text-[14px]! text-[#161e2d]! no-underline! transition-colors! duration-150! hover:text-[#27427f]!"
                  >
                    <MessageCircle className="w-[15px]! h-[15px]! text-gray-400!" />
                    WhatsApp
                  </a>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={reduceMotion ? { duration: 0 } : SETTLE_SPRING}
                    className="flex! items-start! gap-3! py-[6px]!"
                  >
                    <CheckCircle2 className="w-[20px]! h-[20px]! text-emerald-600! shrink-0! mt-[2px]!" />
                    <div>
                      <p className="text-[15px]! font-medium! text-[#161e2d]!">
                        Got it — we&apos;ll call you back.
                      </p>
                      <p className="mt-[5px]! text-[13px]! leading-[1.6]! text-gray-600!">
                        Our liaisoning team will get back to you shortly. If it&apos;s urgent,
                        call {CTA.phoneDisplay}.
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
                    className="space-y-[15px]!"
                  >
                    <div>
                      <label
                        htmlFor="liaisoning-name"
                        className="block! text-[12px]! text-gray-600! mb-[6px]!"
                      >
                        Name
                      </label>
                      <input
                        id="liaisoning-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onBlur={() => onBlur("name")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "liaisoning-name-error" : undefined}
                        placeholder="Your name"
                        className={fieldClass}
                      />
                      {errors.name && (
                        <p
                          id="liaisoning-name-error"
                          className="mt-[5px]! text-[12px]! text-red-600!"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="liaisoning-phone"
                        className="block! text-[12px]! text-gray-600! mb-[6px]!"
                      >
                        Phone
                      </label>
                      <input
                        id="liaisoning-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        onBlur={() => onBlur("phone")}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "liaisoning-phone-error" : undefined}
                        placeholder="10-digit mobile number"
                        className={fieldClass}
                      />
                      {errors.phone && (
                        <p
                          id="liaisoning-phone-error"
                          className="mt-[5px]! text-[12px]! text-red-600!"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="liaisoning-message"
                        className="block! text-[12px]! text-gray-600! mb-[6px]!"
                      >
                        What are you building?
                      </label>
                      <textarea
                        id="liaisoning-message"
                        name="message"
                        rows={3}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onBlur={() => onBlur("message")}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={
                          errors.message ? "liaisoning-message-error" : undefined
                        }
                        placeholder="e.g. 4-floor commercial building on 2,400 sq ft in RS Puram"
                        className={`${fieldClass} resize-none!`}
                      />
                      {errors.message && (
                        <p
                          id="liaisoning-message-error"
                          className="mt-[5px]! text-[12px]! text-red-600!"
                        >
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {errorMsg && (
                      <p
                        className="flex! items-start! gap-2! text-[12px]! text-red-600!"
                        role="alert"
                      >
                        <TriangleAlert className="w-[14px]! h-[14px]! shrink-0! mt-[1px]!" />
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="inline-flex! items-center! justify-center! gap-2! rounded-[10px]! bg-[#27427f]! px-[18px]! py-[11px]! text-[13px]! font-medium! text-white! transition-colors! duration-150! hover:bg-[#1e3563]! active:scale-[0.99]! disabled:opacity-60! disabled:pointer-events-none!"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="w-[14px]! h-[14px]! animate-spin!" />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send className="w-[14px]! h-[14px]!" />
                          {CTA.submitLabel}
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
