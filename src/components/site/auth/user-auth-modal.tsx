"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import {
  requestLoginOtp,
  requestRegisterOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
  type OtpMode,
} from "@/lib/otp-auth";
import { DEFAULT_COUNTRY, flagOf, type Country } from "@/lib/country-codes";
import { useLockBodyScroll } from "@/components/site/shared/use-lock-body-scroll";
import { CountryList } from "@/components/site/auth/country-list";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OtpStatus = "idle" | "verifying" | "error" | "success";

const RESEND_SECONDS = 60;
const OTP_LENGTH = 6;
/** How long the "Verified" state shows before the modal closes. */
const SUCCESS_HOLD_MS = 900;

const mapOtpError = (err: any, mode: OtpMode): string => {
  const status = err?.status;
  if (status === 401) return "That code doesn't match. Check it and try again.";
  if (status === 410)
    return "This code has expired or is locked. Request a new one.";
  if (status === 429)
    return "Too many attempts. Please wait a minute before retrying.";
  if (status === 404 && mode === "login")
    return "No account found with this number. Please register first.";
  if (status === 409 && mode === "register")
    return "This number is already registered. Please log in instead.";
  return err?.message || "Something went wrong. Please try again.";
};

/* The legacy stylesheet styles bare inputs, buttons and selects (Lexend,
   borders, padding, radius), so every control here resets those explicitly. */
const FONT = "!font-['Manrope',sans-serif]";
const RESET_CONTROL =
  "!m-0 !appearance-none !rounded-none !border-0 !p-0 !shadow-none !outline-none !ring-0";
const RESET_INPUT = `${RESET_CONTROL} !bg-transparent`;

/** A plain ring spinner. Drawn with a border so it is the same circle
    everywhere, with nothing trailing off it. */
function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`!inline-block !h-4 !w-4 !shrink-0 !animate-spin !rounded-full !border-2 !border-solid !border-current !border-r-transparent ${className}`}
    />
  );
}

const fieldShell =
  "group/field !relative !flex !h-12 !items-center !rounded-xl !border !border-[#dfe3eb] !bg-white !transition-[border-color,box-shadow] !duration-150 hover:!border-[#c5ccd9] focus-within:!border-[#27427f] focus-within:!shadow-[0_0_0_3px_rgba(39,66,127,0.12)]";
const fieldIcon =
  "!ml-3.5 !shrink-0 !text-[#8a94a6] !transition-colors !duration-150 group-focus-within/field:!text-[#27427f]";
const fieldInput = `${RESET_INPUT} ${FONT} !h-full !min-w-0 !flex-1 !px-3 !text-[15px] !font-medium !text-[#161e2d] placeholder:!font-medium placeholder:!text-[#98a1b2]`;
const fieldLabel = `${FONT} !mb-2 !block !text-[13px] !font-semibold !text-[#344054]`;

export function UserAuthModal({ isOpen, onClose }: UserAuthModalProps) {
  const [mode, setMode] = useState<OtpMode>("login");
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpFocused, setOtpFocused] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const login = useUserAuthStore((state) => state.login);
  const reduceMotion = useReducedMotion();
  const countryCode = country.dial;

  // The modal owns the screen while open; the auth flow opens first and
  // the enquiry dialog only after it closes, so they never lock together.
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // 60s resend countdown while on step 2
  useEffect(() => {
    if (step !== 2 || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  // Reverse expiry countdown. Cosmetic only — the backend owns expiry, and it
  // rejects an expired code regardless of what this shows.
  useEffect(() => {
    if (step !== 2 || expiresIn === null || expiresIn <= 0) return;
    const t = setTimeout(() => setExpiresIn((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [step, expiresIn]);

  const resetForMode = (next: OtpMode) => {
    setMode(next);
    setStep(1);
    setOtp("");
    setOtpStatus("idle");
    setError(null);
    setExpiresIn(null);
    setResendIn(0);
  };

  const validateStep1 = (): string | null => {
    const cleanPhone = phone.replace(/\D/g, "");
    // Indian mobiles are exactly 10 digits; elsewhere accept what the API
    // accepts (5–15 digits).
    const validPhone =
      countryCode === "+91"
        ? cleanPhone.length === 10
        : cleanPhone.length >= 5 && cleanPhone.length <= 15;
    if (!validPhone) {
      return "Please enter a valid mobile number.";
    }
    if (mode === "register") {
      if (!name.trim()) {
        return "Please enter your name.";
      }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return "Please enter a valid email address.";
      }
    }
    return null;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    // A submit that lands while a request is already in flight — a second
    // click queued ahead of the disabling re-render, or a programmatic
    // submit — must not fire again. Each request sends a real SMS.
    if (loading) return;
    setError(null);
    setCountryOpen(false);

    const step1Error = validateStep1();
    if (step1Error) {
      setError(step1Error);
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");

    setLoading(true);
    try {
      const res =
        mode === "register"
          ? await requestRegisterOtp({
              name: name.trim(),
              email: email.trim(),
              countryCode,
              phone: cleanPhone,
            })
          : await requestLoginOtp({ countryCode, phone: cleanPhone });
      setExpiresIn(res.expiresInSeconds ?? null);
      setOtp("");
      setOtpStatus("idle");
      setStep(2);
      setResendIn(RESEND_SECONDS);
    } catch (err: any) {
      setError(mapOtpError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (loading || otpStatus === "verifying" || otpStatus === "success") return;
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanOtp = code.replace(/\D/g, "");
    if (cleanOtp.length !== OTP_LENGTH) {
      setOtpStatus("error");
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setOtpStatus("verifying");
    try {
      const res =
        mode === "register"
          ? await verifyRegisterOtp({
              countryCode,
              phone: cleanPhone,
              otp: cleanOtp,
              name: name.trim(),
              email: email.trim(),
            })
          : await verifyLoginOtp({
              countryCode,
              phone: cleanPhone,
              otp: cleanOtp,
            });

      if (res?.accessToken && res?.user) {
        login(res.accessToken, res.user);
        setOtpStatus("success");
        // Hold the verified state long enough to be seen, then close.
        closeTimer.current = setTimeout(() => {
          onClose();
          setPhone("");
          setOtp("");
          setOtpStatus("idle");
          setStep(1);
        }, SUCCESS_HOLD_MS);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setOtpStatus("error");
      setError(mapOtpError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    void verifyOtp(otp);
  };

  const handleOtpChange = (value: string) => {
    const next = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (otpStatus === "success" || otpStatus === "verifying") return;
    setOtp(next);
    // Editing after a rejected code clears the error state.
    if (otpStatus === "error") {
      setOtpStatus("idle");
      setError(null);
    }
    // The sixth digit verifies on its own; no extra tap needed.
    if (next.length === OTP_LENGTH && otp.length < OTP_LENGTH) {
      void verifyOtp(next);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    setError(null);
    const step1Error = validateStep1();
    if (step1Error) {
      setError(step1Error);
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    setLoading(true);
    try {
      const res =
        mode === "register"
          ? await requestRegisterOtp({
              name: name.trim(),
              email: email.trim(),
              countryCode,
              phone: cleanPhone,
            })
          : await requestLoginOtp({ countryCode, phone: cleanPhone });
      setExpiresIn(res.expiresInSeconds ?? null);
      setOtp("");
      setOtpStatus("idle");
      setResendIn(RESEND_SECONDS);
    } catch (err: any) {
      setError(mapOtpError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  const cleanPhoneDisplay = phone.replace(/\D/g, "");
  const activeOtpIndex = Math.min(otp.length, OTP_LENGTH - 1);
  const ease = [0.23, 1, 0.32, 1] as const;

  const submitLabel =
    step === 1
      ? "Get verification code"
      : mode === "register"
        ? "Verify and create account"
        : "Verify and sign in";

  /** One OTP cell's look, driven by the code's status first, then its own fill/focus. */
  const otpCellClass = (index: number) => {
    const filled = index < otp.length;
    const active = otpFocused && index === activeOtpIndex && otpStatus === "idle";
    if (otpStatus === "success") return "!border-[#16a34a] !bg-[#f0fdf4] !text-[#15803d]";
    if (otpStatus === "error") return "!border-[#e5484d] !bg-[#fff5f5] !text-[#c4320a]";
    if (otpStatus === "verifying") return "!border-[#27427f]/35 !bg-[#f5f8ff] !text-[#27427f]";
    if (active) return "!border-[#27427f] !bg-white !text-[#161e2d] !shadow-[0_0_0_3px_rgba(39,66,127,0.12)]";
    if (filled) return "!border-[#27427f]/45 !bg-[#f5f8ff] !text-[#161e2d]";
    return "!border-[#dfe3eb] !bg-white !text-[#161e2d]";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="!fixed !inset-0 !z-[10000] !flex !items-end !justify-center sm:!items-center sm:!p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            onClick={onClose}
            className="!absolute !inset-0 !bg-[#0d1424]/55 !backdrop-blur-[6px]"
          />

          {/* Sheet on mobile, centred card from sm up */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-auth-title"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.32, ease }}
            className={`!relative !flex !max-h-[92dvh] !w-full !flex-col !overflow-hidden !rounded-t-[24px] !bg-white !shadow-[0_30px_80px_-20px_rgba(13,20,36,0.45)] sm:!max-w-[420px] sm:!rounded-[24px] ${FONT}`}
          >
            <section className="!relative !flex !flex-col !overflow-y-auto !px-6 !pb-7 !pt-4 sm:!px-8 sm:!pb-8 sm:!pt-7">
              {/* Grab handle (mobile sheet) */}
              <div className="!mx-auto !mb-5 !h-1 !w-10 !rounded-full !bg-[#e4e7ec] sm:!hidden" />

              <div className="!mb-7 !flex !items-center !justify-between">
                <Image
                  src="/assets/images/logo/fav.png"
                  alt="Majestan Realty"
                  width={40}
                  height={40}
                  className="!h-10 !w-10 !object-contain"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className={`${RESET_INPUT} !-mr-2 !flex !h-9 !w-9 !cursor-pointer !items-center !justify-center !rounded-full !text-[#667085] !transition-colors !duration-150 hover:!bg-[#f2f4f7] hover:!text-[#161e2d]`}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Heading. Re-keyed per view so the new copy fades in rather
                  than snapping. */}
              <motion.div
                key={`heading-${mode}-${step}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease }}
                className="!mb-6"
              >
                <h2
                  id="user-auth-title"
                  className={`!m-0 !text-[24px] !font-bold !leading-[1.2] !tracking-[-0.02em] !text-[#101828] ${FONT}`}
                >
                  {step === 2
                    ? "Enter OTP"
                    : mode === "register"
                      ? "Create your account"
                      : "Welcome back"}
                </h2>
                <p className={`!m-0 !mt-1.5 !text-[14px] !font-medium !leading-[1.6] !text-[#667085] ${FONT}`}>
                  {step === 2 ? (
                    <>
                      We sent a 6-digit code to{" "}
                      <span className="!font-semibold !text-[#101828]">
                        {countryCode} {cleanPhoneDisplay}
                      </span>
                    </>
                  ) : mode === "register" ? (
                    "A few details and you're in. No password needed."
                  ) : (
                    "Sign in with your mobile number. We'll text you a code."
                  )}
                </p>
              </motion.div>

              {/* Mode toggle */}
              {step === 1 && (
                <div
                  role="tablist"
                  aria-label="Login or register"
                  className="!mb-6 !grid !grid-cols-2 !rounded-xl !bg-[#f2f4f7] !p-1"
                >
                  {(["login", "register"] as OtpMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => resetForMode(m)}
                      className={`${RESET_INPUT} ${FONT} !relative !h-9 !cursor-pointer !rounded-lg !text-[14px] !font-semibold !transition-colors !duration-200 ${
                        mode === m ? "!text-[#101828]" : "!text-[#667085] hover:!text-[#101828]"
                      }`}
                    >
                      {mode === m && (
                        <motion.span
                          layoutId="user-auth-mode-pill"
                          transition={{ duration: reduceMotion ? 0 : 0.3, ease }}
                          className="!absolute !inset-0 !rounded-lg !bg-white !shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.1)]"
                        />
                      )}
                      <span className="!relative">
                        {m === "login" ? "Login" : "Register"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}
                noValidate
              >
                {/* Height-animated so the form below slides rather than jumps. */}
                <AnimatePresence initial={false}>
                  {error && (
                    <motion.div
                      key="error"
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease }}
                      className="!overflow-hidden"
                    >
                      <div className="!pb-4">
                        <div
                          role="alert"
                          className={`!flex !items-start !gap-2.5 !rounded-xl !border !border-[#fecdca] !bg-[#fef3f2] !px-3.5 !py-3 !text-[13px] !font-semibold !leading-[1.5] !text-[#b42318] ${FONT}`}
                        >
                          <AlertCircle size={16} className="!mt-[1px] !shrink-0" />
                          <span>{error}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Keyed by step only: switching login/register keeps the phone
                    field mounted (and focused) and only the register fields
                    open or close. No exit animation, so the OTP view never
                    waits on the previous one. */}
                <motion.div
                  key={`step-${step}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease }}
                >
                  {step === 1 ? (
                    <>
                      <AnimatePresence initial={false}>
                        {mode === "register" && (
                          <motion.div
                            key="register-fields"
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            transition={{
                              height: { duration: 0.32, ease },
                              opacity: { duration: 0.2, ease },
                            }}
                            className="!overflow-hidden"
                          >
                            <div className="!space-y-4 !pb-4">
                              <div>
                                <label htmlFor="user-auth-name" className={fieldLabel}>
                                  Full name
                                </label>
                                <div className={fieldShell}>
                                  <User size={18} className={fieldIcon} />
                                  <input
                                    id="user-auth-name"
                                    type="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className={fieldInput}
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label htmlFor="user-auth-email" className={fieldLabel}>
                                  Email
                                </label>
                                <div className={fieldShell}>
                                  <Mail size={18} className={fieldIcon} />
                                  <input
                                    id="user-auth-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={fieldInput}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label htmlFor="user-auth-phone" className={fieldLabel}>
                          Mobile number
                        </label>
                        <div className={`${fieldShell} ${countryOpen ? "!border-[#27427f] !shadow-[0_0_0_3px_rgba(39,66,127,0.12)]" : ""}`}>
                          <button
                            type="button"
                            onClick={() => setCountryOpen((o) => !o)}
                            aria-haspopup="listbox"
                            aria-expanded={countryOpen}
                            aria-label={`Country code ${country.name} ${country.dial}`}
                            className={`${RESET_INPUT} ${FONT} !flex !h-full !shrink-0 !cursor-pointer !items-center !gap-2 !rounded-l-xl !border-r !border-solid !border-[#eaecf0] !pl-3.5 !pr-2.5 !text-[15px] !font-semibold !text-[#101828] !transition-colors !duration-150 hover:!bg-[#f9fafb]`}
                          >
                            <span className="!text-[18px] !leading-none" aria-hidden="true">
                              {flagOf(country.iso)}
                            </span>
                            <span className="!tabular-nums">{country.dial}</span>
                            <ChevronDown
                              size={15}
                              aria-hidden="true"
                              className={`!text-[#8a94a6] !transition-transform !duration-200 ${countryOpen ? "!rotate-180" : ""}`}
                            />
                          </button>
                          <input
                            ref={phoneInputRef}
                            id="user-auth-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => setCountryOpen(false)}
                            placeholder={countryCode === "+91" ? "90929 65556" : "Mobile number"}
                            className={`${fieldInput} !tracking-[0.01em]`}
                            required
                            autoFocus
                          />
                        </div>

                        <AnimatePresence initial={false}>
                          {countryOpen && (
                            <motion.div
                              key="country-list"
                              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                              transition={{ height: { duration: 0.28, ease }, opacity: { duration: 0.18, ease } }}
                              className="!overflow-hidden"
                            >
                              <div className="!pt-2">
                                <CountryList
                                  value={country}
                                  onSelect={(c) => {
                                    setCountry(c);
                                    setCountryOpen(false);
                                    phoneInputRef.current?.focus();
                                  }}
                                  onClose={() => {
                                    setCountryOpen(false);
                                    phoneInputRef.current?.focus();
                                  }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <div className="!space-y-4">
                      {/* One real input under six display cells, so paste,
                          SMS autofill and screen readers all see a single field. */}
                      <motion.div
                        className="!relative"
                        animate={
                          otpStatus === "error" && !reduceMotion
                            ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                            : { x: 0 }
                        }
                        transition={{ duration: 0.42, ease: "easeInOut" }}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label="6-digit code"
                          aria-invalid={otpStatus === "error"}
                          maxLength={OTP_LENGTH}
                          value={otp}
                          onChange={(e) => handleOtpChange(e.target.value)}
                          onFocus={() => setOtpFocused(true)}
                          onBlur={() => setOtpFocused(false)}
                          disabled={otpStatus === "success"}
                          className="!absolute !inset-0 !z-10 !h-full !w-full !cursor-text !opacity-0"
                          required
                          autoFocus
                        />
                        <div className="!grid !grid-cols-6 !gap-2" aria-hidden="true">
                          {Array.from({ length: OTP_LENGTH }, (_, i) => {
                            const digit = otp[i];
                            const showCaret =
                              otpFocused && i === activeOtpIndex && !digit && otpStatus === "idle";
                            return (
                              <motion.div
                                key={i}
                                animate={
                                  otpStatus === "verifying" && !reduceMotion
                                    ? { opacity: [1, 0.55, 1] }
                                    : { opacity: 1 }
                                }
                                transition={
                                  otpStatus === "verifying"
                                    ? { duration: 1, repeat: Infinity, delay: i * 0.08 }
                                    : { duration: 0.15 }
                                }
                                className={`!flex !h-[52px] !items-center !justify-center !rounded-xl !border !text-[22px] !font-bold !tabular-nums !transition-[border-color,background-color,color,box-shadow] !duration-150 ${FONT} ${otpCellClass(i)}`}
                              >
                                {digit ? (
                                  <motion.span
                                    key={`${i}-${digit}`}
                                    initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                                  >
                                    {digit}
                                  </motion.span>
                                ) : showCaret ? (
                                  <span className="!h-6 !w-[2px] !animate-pulse !rounded-full !bg-[#27427f]" />
                                ) : null}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>

                      {/* One status line under the code: verifying and verified
                          replace the timer while they apply. The backend owns
                          expiry; the countdown is cosmetic. */}
                      <div className={`!flex !min-h-[20px] !items-center !justify-between !text-[13px] ${FONT}`}>
                        {otpStatus === "verifying" ? (
                          <span className="!inline-flex !items-center !gap-1.5 !font-semibold !text-[#27427f]" aria-live="polite">
                            <Spinner className="!h-3.5 !w-3.5" />
                            Verifying code…
                          </span>
                        ) : otpStatus === "success" ? (
                          <span className="!inline-flex !items-center !gap-1.5 !font-semibold !text-[#15803d]" aria-live="polite">
                            <CheckCircle2 size={15} />
                            Verified. Signing you in…
                          </span>
                        ) : (
                          <>
                            <span
                              className={`!inline-flex !items-center !gap-1.5 !font-medium !tabular-nums ${
                                expiresIn !== null && expiresIn > 0 ? "!text-[#667085]" : "!text-[#b42318]"
                              }`}
                              aria-live="polite"
                            >
                              <Clock size={14} />
                              {expiresIn !== null && expiresIn > 0
                                ? `Expires in ${expiresIn}s`
                                : "Code expired"}
                            </span>
                            <button
                              type="button"
                              onClick={handleResend}
                              disabled={resendIn > 0 || loading}
                              className={`${RESET_INPUT} ${FONT} !cursor-pointer !text-[13px] !font-semibold !tabular-nums !text-[#27427f] hover:!underline !underline-offset-4 disabled:!cursor-not-allowed disabled:!text-[#98a1b2] disabled:hover:!no-underline`}
                            >
                              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                <button
                  type="submit"
                  disabled={loading || otpStatus === "success"}
                  className={`${RESET_CONTROL} ${FONT} !mt-6 !flex !h-12 !w-full !cursor-pointer !items-center !justify-center !gap-2 !rounded-xl !text-[15px] !font-semibold !text-white !transition-[background-color,transform,box-shadow] !duration-150 active:!scale-[0.985] disabled:!cursor-wait ${
                    otpStatus === "success"
                      ? "!bg-[#16a34a]"
                      : "!bg-[#27427f] !shadow-[0_8px_20px_-10px_rgba(39,66,127,0.7)] hover:!bg-[#1e3366] disabled:!opacity-80"
                  }`}
                >
                  {otpStatus === "success" ? (
                    <>
                      <CheckCircle2 size={18} />
                      Verified
                    </>
                  ) : loading ? (
                    <>
                      <Spinner />
                      {step === 1 ? "Sending code…" : "Verifying…"}
                    </>
                  ) : (
                    submitLabel
                  )}
                </button>

                <p className={`!m-0 !mt-4 !flex !items-center !justify-center !gap-1.5 !text-center !text-[12px] !font-medium !leading-[1.6] !text-[#667085] ${FONT}`}>
                  <ShieldCheck size={14} className="!shrink-0 !text-[#27427f]/70" />
                  <span>
                    By continuing you agree to our{" "}
                    <a href="#" className="!font-semibold !text-[#27427f] hover:!underline !underline-offset-4">
                      Terms
                    </a>{" "}
                    &{" "}
                    <a href="#" className="!font-semibold !text-[#27427f] hover:!underline !underline-offset-4">
                      Privacy Policy
                    </a>
                  </span>
                </p>
              </form>
            </section>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
