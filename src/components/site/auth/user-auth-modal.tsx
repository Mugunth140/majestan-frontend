"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Loader2,
  ChevronDown,
  ArrowRight,
  AlertCircle,
  Check,
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
import { useLockBodyScroll } from "@/components/site/shared/use-lock-body-scroll";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESEND_SECONDS = 60;

const mapOtpError = (err: any, mode: OtpMode): string => {
  const status = err?.status;
  if (status === 401) return "Invalid OTP. Please check the code and try again.";
  if (status === 410)
    return "This OTP has expired or is locked. Please request a new code.";
  if (status === 429)
    return "Too many attempts. Please wait a minute before retrying.";
  if (status === 404 && mode === "login")
    return "No account found with this number. Please register first.";
  if (status === 409 && mode === "register")
    return "This number is already registered. Please log in instead.";
  return err?.message || "Something went wrong. Please try again.";
};

export function UserAuthModal({ isOpen, onClose }: UserAuthModalProps) {
  const [mode, setMode] = useState<OtpMode>("login");
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpFocused, setOtpFocused] = useState(false);
  const login = useUserAuthStore((state) => state.login);
  const reduceMotion = useReducedMotion();

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
    setError(null);
    setExpiresIn(null);
    setResendIn(0);
  };

  const validateStep1 = (): string | null => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return "Please enter a valid phone number.";
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
      setStep(2);
      setResendIn(RESEND_SECONDS);
    } catch (err: any) {
      setError(mapOtpError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
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
        onClose();
        setPhone("");
        setOtp("");
        setStep(1);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(mapOtpError(err, mode));
    } finally {
      setLoading(false);
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
      setResendIn(RESEND_SECONDS);
    } catch (err: any) {
      setError(mapOtpError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  const cleanPhoneDisplay = phone.replace(/\D/g, "");
  const otpDigits = otp.padEnd(6, " ").split("");
  const activeOtpIndex = Math.min(otp.length, 5);
  const ease = [0.23, 1, 0.32, 1] as const;

  const fieldShell =
    "!relative !flex !items-center !rounded-2xl !border !border-[#27427f]/10 !bg-[#f6f7fb] !transition-[background-color,border-color,box-shadow] !duration-200 hover:!border-[#27427f]/20 focus-within:!border-[#27427f]/50 focus-within:!bg-white focus-within:!shadow-[0_0_0_4px_rgba(39,66,127,0.08)]";
  const fieldIcon = "!ml-4 !shrink-0 !text-[#27427f]/55";
  const fieldInput =
    "!h-[52px] !min-w-0 !flex-1 !bg-transparent !px-3 !text-[15px] !font-medium !text-[#161e2d] !outline-none placeholder:!font-normal placeholder:!text-[#5c5e61]/55";
  const fieldLabel =
    "!mb-1.5 !block !text-[12px] !font-semibold !uppercase !tracking-[0.08em] !text-[#5c5e61]";

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

          {/* Sheet on mobile, split card from sm up */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-auth-title"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.32, ease }}
            className="!relative !grid !max-h-[92dvh] !w-full !overflow-hidden !rounded-t-[28px] !bg-white !font-['Manrope',sans-serif] !shadow-[0_30px_80px_-20px_rgba(13,20,36,0.45)] sm:!max-w-[440px] sm:!rounded-[28px] md:!min-h-[560px] md:!max-w-[900px] md:!grid-cols-[0.95fr_1.05fr]"
          >
            {/* Brand panel (md+) */}
            <aside className="!relative !hidden !overflow-hidden md:!block">
              <Image
                src="/assets/images/hero/hero_mobile.png"
                alt=""
                fill
                sizes="430px"
                className="!object-cover !object-[50%_85%]"
                priority
              />
              <div className="!absolute !inset-0 !bg-gradient-to-b !from-[#0d1424]/10 !via-[#1b2f5c]/30 !to-[#0d1424]/90" />
              <div className="!relative !flex !h-full !flex-col !justify-between !p-9">
                <Image
                  src="/assets/images/logo/logo-white.png"
                  alt="Majestan Realty"
                  width={150}
                  height={40}
                  className="!h-auto !w-[150px] !object-contain"
                />
                <div>
                  <span className="!mb-4 !inline-block !h-1 !w-10 !rounded-full !bg-[#ffc900]" />
                  <p className="!mb-5 !text-[28px] !font-semibold !leading-[1.15] !tracking-[-0.02em] !text-white">
                    Find the home that fits your next chapter.
                  </p>
                  <ul className="!space-y-2.5">
                    {[
                      "Save properties to your wishlist",
                      "Talk to our experts directly",
                      "Post your property for free",
                    ].map((item) => (
                      <li
                        key={item}
                        className="!flex !items-center !gap-2.5 !text-[14px] !font-medium !text-white/85"
                      >
                        <span className="!flex !h-5 !w-5 !shrink-0 !items-center !justify-center !rounded-full !bg-[#ffc900]/15 !text-[#ffc900]">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Form panel */}
            <section className="!relative !flex !flex-col !justify-center !overflow-y-auto !px-6 !pb-8 !pt-4 sm:!px-9 sm:!pb-9 sm:!pt-9">
              {/* Grab handle (mobile sheet) */}
              <div className="!mx-auto !mb-5 !h-1 !w-10 !rounded-full !bg-gray-200 sm:!hidden" />

              <button
                type="button"
                onClick={onClose}
                className="!absolute !right-4 !top-4 !z-10 !flex !h-9 !w-9 !cursor-pointer !items-center !justify-center !rounded-full !text-[#5c5e61] !transition-colors !duration-150 hover:!bg-[#f0f2f7] hover:!text-[#161e2d] sm:!right-5 sm:!top-5"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Compact logo where the brand panel is hidden */}
              <Image
                src="/assets/images/logo/logo.png"
                alt="Majestan Realty"
                width={130}
                height={36}
                className="!mb-6 !h-auto !w-[130px] !object-contain md:!hidden"
              />

              {/* Heading */}
              <div className="!mb-6 !pr-8">
                <h2
                  id="user-auth-title"
                  className="!mb-1.5 !text-[26px] !font-semibold !leading-[1.2] !tracking-[-0.02em] !text-[#161e2d]"
                >
                  {step === 2
                    ? "Enter OTP"
                    : mode === "register"
                      ? "Create account"
                      : "Welcome back"}
                </h2>
                <p className="!text-[14px] !leading-[1.6] !text-[#5c5e61]">
                  {step === 2 ? (
                    <>
                      We sent a 6-digit code to{" "}
                      <span className="!font-semibold !text-[#161e2d]">
                        {countryCode} {cleanPhoneDisplay}
                      </span>
                      .
                    </>
                  ) : mode === "register" ? (
                    "A few details and you're in. No password needed."
                  ) : (
                    "Sign in with your mobile number. We'll text you a code."
                  )}
                </p>
              </div>

              {/* Mode toggle */}
              {step === 1 && (
                <div
                  role="tablist"
                  aria-label="Login or register"
                  className="!mb-6 !grid !grid-cols-2 !rounded-full !bg-[#f0f2f7] !p-1"
                >
                  {(["login", "register"] as OtpMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => resetForMode(m)}
                      className={`!relative !h-10 !rounded-full !text-[14px] !font-semibold !transition-colors !duration-200 ${
                        mode === m ? "!text-[#161e2d]" : "!text-[#5c5e61] hover:!text-[#161e2d]"
                      }`}
                    >
                      {mode === m && (
                        <motion.span
                          layoutId="user-auth-mode-pill"
                          transition={{ duration: reduceMotion ? 0 : 0.3, ease }}
                          className="!absolute !inset-0 !rounded-full !bg-white !shadow-[0_1px_2px_rgba(13,20,36,0.08),0_4px_12px_-4px_rgba(13,20,36,0.12)]"
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
                className="!space-y-4"
                noValidate
              >
                {error && (
                  <div
                    role="alert"
                    className="!flex !items-start !gap-2.5 !rounded-2xl !bg-[#fdf1f0] !px-4 !py-3 !text-[13px] !font-medium !leading-[1.5] !text-[#b42318]"
                  >
                    <AlertCircle size={16} className="!mt-[1px] !shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Keyed so each mode/step fades in; no exit animation, so the
                    next view never waits on the previous one. */}
                <motion.div
                  key={`${mode}-${step}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease }}
                  className="!space-y-4"
                >
                  {step === 1 ? (
                    <>
                      {mode === "register" && (
                        <>
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
                        </>
                      )}

                      <div>
                        <label htmlFor="user-auth-phone" className={fieldLabel}>
                          Mobile number
                        </label>
                        <div className={fieldShell}>
                          <div className="!relative !flex !h-[52px] !shrink-0 !items-center !border-r !border-[#27427f]/10">
                            <select
                              aria-label="Country code"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="!block !h-full !cursor-pointer !appearance-none !border-0 !bg-transparent !pl-4 !pr-8 !text-[15px] !font-semibold !text-[#161e2d] !outline-none"
                            >
                              <option value="+91">+91</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
                              <option value="+971">+971</option>
                              <option value="+61">+61</option>
                            </select>
                            <ChevronDown
                              size={14}
                              className="!pointer-events-none !absolute !right-3 !top-1/2 !-translate-y-1/2 !text-[#5c5e61]"
                            />
                          </div>
                          <input
                            id="user-auth-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="90929 65556"
                            className={`${fieldInput} !px-4 !tracking-[0.02em]`}
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* One real input under six display cells, so paste,
                          SMS autofill and screen readers all see a single field. */}
                      <div className="!relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label="6-digit code"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          onFocus={() => setOtpFocused(true)}
                          onBlur={() => setOtpFocused(false)}
                          className="!absolute !inset-0 !z-10 !h-full !w-full !cursor-text !opacity-0"
                          required
                          autoFocus
                        />
                        <div className="!grid !grid-cols-6 !gap-2 sm:!gap-2.5" aria-hidden="true">
                          {otpDigits.map((digit, i) => {
                            const active = otpFocused && i === activeOtpIndex;
                            const filled = digit.trim() !== "";
                            return (
                              <div
                                key={i}
                                className={`!flex !h-14 !items-center !justify-center !rounded-2xl !border !text-[22px] !font-semibold !tabular-nums !text-[#161e2d] !transition-[border-color,background-color,box-shadow] !duration-150 ${
                                  active
                                    ? "!border-[#27427f]/60 !bg-white !shadow-[0_0_0_4px_rgba(39,66,127,0.08)]"
                                    : filled
                                      ? "!border-[#27427f]/20 !bg-white"
                                      : "!border-[#27427f]/10 !bg-[#f6f7fb]"
                                }`}
                              >
                                {filled ? (
                                  digit
                                ) : active ? (
                                  <span className="!h-6 !w-[2px] !animate-pulse !rounded-full !bg-[#27427f]" />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expiry countdown + resend. The backend owns expiry;
                          this countdown is cosmetic. */}
                      <div className="!flex !items-center !justify-between !text-[13px]">
                        <span
                          className={`!inline-flex !items-center !gap-1.5 !font-medium !tabular-nums ${
                            expiresIn !== null && expiresIn > 0
                              ? "!text-[#5c5e61]"
                              : "!text-[#b42318]"
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
                          className="!font-semibold !tabular-nums !text-[#27427f] !transition-opacity hover:!underline !underline-offset-4 disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:!no-underline"
                        >
                          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>

                <button
                  type="submit"
                  disabled={loading}
                  className="!group !mt-2 !flex !h-[52px] !w-full !items-center !justify-center !gap-2 !rounded-full !bg-[#27427f] !text-[15px] !font-semibold !text-white !shadow-[0_10px_24px_-10px_rgba(39,66,127,0.6)] !transition-[background-color,transform] !duration-150 hover:!bg-[#1e3366] active:!scale-[0.98] disabled:!cursor-wait disabled:!opacity-75"
                >
                  {loading ? (
                    <Loader2 size={20} className="!animate-spin" aria-label="Loading" />
                  ) : (
                    <>
                      {step === 1 ? "Send OTP" : "Verify & Continue"}
                      <ArrowRight
                        size={18}
                        className="!transition-transform !duration-200 group-hover:!translate-x-0.5"
                      />
                    </>
                  )}
                </button>

                <p className="!flex !items-center !justify-center !gap-1.5 !pt-1 !text-center !text-[12px] !leading-[1.6] !text-[#5c5e61]">
                  <ShieldCheck size={14} className="!shrink-0 !text-[#27427f]/60" />
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
