"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, MessageCircle, Phone, Send, TriangleAlert } from "lucide-react";

import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { CTA } from "./content";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { Reveal } from "./reveal";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Inline validation on blur, not on submit — validate-while-typing-before-submit
 * is how people end up fixing six errors at once instead of one.
 */
type FieldErrors = { name?: string; phone?: string; message?: string };

const SETTLE_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

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
          <div className="relative! overflow-hidden! rounded-[28px]! bg-[#161e2d]! px-[26px]! py-[34px]! md:px-[46px]! md:py-[52px]!">
            <div
              aria-hidden="true"
              className="pointer-events-none! absolute! -top-24! -right-16! w-[420px]! h-[420px]! rounded-full!"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,201,0,0.16) 0%, rgba(255,201,0,0) 70%)",
              }}
            />

            <div className="relative! grid! grid-cols-1! lg:grid-cols-[1.05fr_1fr]! gap-[34px]! items-start!">
              <div>
                <h2
                  id="cta-heading"
                  className="text-[clamp(24px,3.2vw,36px)]! font-semibold! text-white! leading-[1.1]! tracking-[-0.02em]!"
                >
                  {CTA.title}
                </h2>
                <p className="mt-[12px]! text-[14px]! md:text-[15px]! font-normal! text-white/70! leading-[1.65]! max-w-lg!">
                  {CTA.description}
                </p>

                <div className="mt-[26px]! flex! flex-wrap! gap-[12px]!">
                  <a
                    href={`tel:${CTA.phone}`}
                    className="inline-flex! items-center! gap-2! rounded-full! bg-[#ffc900]! px-[20px]! py-[11px]! text-[13px]! font-bold! text-[#161e2d]! no-underline! transition-all! duration-200! hover:brightness-105! active:scale-[0.97]!"
                  >
                    <Phone className="w-[15px]! h-[15px]!" />
                    {CTA.phoneDisplay}
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="liaisoning-translucent inline-flex! items-center! gap-2! rounded-full! bg-white/10! backdrop-blur-md! border! border-white/20! px-[20px]! py-[11px]! text-[13px]! font-semibold! text-white! no-underline! transition-all! duration-200! hover:bg-white/20! active:scale-[0.97]!"
                  >
                    <MessageCircle className="w-[15px]! h-[15px]!" />
                    WhatsApp us
                  </a>
                </div>
              </div>

              <div className="rounded-[22px]! bg-white! p-[22px]! md:p-[26px]! shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)]!">
                <AnimatePresence mode="wait" initial={false}>
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : SETTLE_SPRING}
                      className="flex! items-start! gap-3! py-[10px]!"
                    >
                      <CheckCircle2 className="w-[22px]! h-[22px]! text-emerald-600! shrink-0! mt-[2px]!" />
                      <div>
                        <p className="text-[15px]! font-semibold! text-[#161e2d]!">
                          Got it — we&apos;ll call you back.
                        </p>
                        <p className="mt-[6px]! text-[13px]! text-gray-600! leading-[1.6]!">
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
                      className="space-y-[14px]!"
                    >
                      <div>
                        <label
                          htmlFor="liaisoning-name"
                          className="block! text-[12px]! font-semibold! text-gray-700! mb-[6px]!"
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
                          className="w-full! px-[14px]! py-[11px]! rounded-[12px]! bg-[#f7f9fc]! border! border-transparent! text-[14px]! text-[#161e2d]! outline-none! placeholder:text-gray-400! transition-all! focus:bg-white! focus:border-[#27427f]/45!"
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
                          className="block! text-[12px]! font-semibold! text-gray-700! mb-[6px]!"
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
                          className="w-full! px-[14px]! py-[11px]! rounded-[12px]! bg-[#f7f9fc]! border! border-transparent! text-[14px]! text-[#161e2d]! outline-none! placeholder:text-gray-400! transition-all! focus:bg-white! focus:border-[#27427f]/45!"
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
                          className="block! text-[12px]! font-semibold! text-gray-700! mb-[6px]!"
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
                          className="w-full! px-[14px]! py-[11px]! rounded-[12px]! bg-[#f7f9fc]! border! border-transparent! text-[14px]! text-[#161e2d]! outline-none! placeholder:text-gray-400! resize-none! transition-all! focus:bg-white! focus:border-[#27427f]/45!"
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
                        <p className="flex! items-start! gap-2! text-[12px]! text-red-600!" role="alert">
                          <TriangleAlert className="w-[14px]! h-[14px]! shrink-0! mt-[1px]!" />
                          {errorMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="w-full! inline-flex! items-center! justify-center! gap-2! rounded-[12px]! bg-[#27427f]! px-[20px]! py-[12px]! text-[13px]! font-bold! text-white! transition-all! duration-200! hover:bg-[#1e3563]! active:scale-[0.98]! disabled:opacity-60! disabled:pointer-events-none!"
                      >
                        {status === "submitting" ? (
                          <>
                            <Loader2 className="w-[15px]! h-[15px]! animate-spin!" />
                            Sending
                          </>
                        ) : (
                          <>
                            <Send className="w-[15px]! h-[15px]!" />
                            {CTA.submitLabel}
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
