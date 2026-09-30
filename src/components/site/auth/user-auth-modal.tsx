"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronDown } from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import {
  requestLoginOtp,
  requestRegisterOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
  type OtpMode,
} from "@/lib/otp-auth";

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
  const login = useUserAuthStore((state) => state.login);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="!fixed !inset-0 !z-[9999] !flex !items-center !justify-center !p-4">
          {/* Backdrop — matches CRM login background feel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="!absolute !inset-0 !bg-black/40 !backdrop-blur-sm"
          />

          {/* Card — exact CRM card style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="!relative !w-full !max-w-[400px] !flex !flex-col !justify-center !p-8 !font-['Manrope',sans-serif] !bg-white/95 !backdrop-blur-xl !rounded-[2rem] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] !border !border-white/50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="!absolute !right-5 !top-5 !z-50 !flex !h-9 !w-9 !cursor-pointer !items-center !justify-center !rounded-full !bg-gray-100 !text-gray-500 !transition-colors hover:!bg-gray-200 hover:!text-gray-700"
              aria-label="Close"
            >
              <X size={17} />
            </button>

            {/* Logo */}
            <div className="!mb-7 !flex !items-center !justify-center">
              <Image
                src="/assets/images/logo/logo.png"
                alt="Majestan Realty"
                width={160}
                height={160}
                className="!h-auto !w-[160px] !object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <div className="!mb-7">
              <h1 className="!mb-2.5 !font-['Manrope',sans-serif] !text-[26px] !font-semibold !leading-[1.2] !tracking-[-0.02em] !text-gray-900 !text-center">
                {step === 2
                  ? "Enter OTP"
                  : mode === "register"
                    ? "Create account"
                    : "Welcome back"}
              </h1>
              <p className="!font-['Manrope',sans-serif] !text-[14px] !font-normal !leading-[1.6] !text-gray-500 !text-center">
                {step === 2
                  ? `We sent a 6-digit code to ${countryCode} ${phone.replace(/\D/g, "")}.`
                  : mode === "register"
                    ? "Enter your details to create your account."
                    : "Enter your mobile number to instantly access your account."}
              </p>
            </div>

            {/* Mode toggle */}
            {step === 1 && (
              <div className="!mb-5 !flex !rounded-xl !bg-gray-100 !p-1">
                {(["login", "register"] as OtpMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => resetForMode(m)}
                    className={`!flex-1 !h-10 !rounded-lg !text-[14px] !font-semibold !transition-all ${
                      mode === m
                        ? "!bg-white !text-gray-900 !shadow"
                        : "!text-gray-500 hover:!text-gray-700"
                    }`}
                  >
                    {m === "login" ? "Login" : "Register"}
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}
              className="!space-y-5 sm:!space-y-6"
            >
              {/* Error */}
              {error && (
                <div className="!rounded-xl !border !border-red-200 !bg-red-50 !px-4 !py-3 !text-[13px] !font-medium !text-red-700">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <>
                  {/* Name + email for register */}
                  {mode === "register" && (
                    <>
                      <div className="!space-y-1.5 !relative !group">
                        <label className="!text-xs !font-semibold !tracking-wide !text-gray-500 !ml-1">
                          Full Name
                        </label>
                        <div className="!relative !mt-1 !flex !items-stretch !rounded-xl !bg-gray-50 !border !border-gray-200 !overflow-hidden !transition-all hover:!bg-gray-100 focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-[#27427f]/20 focus-within:!border-[#27427f]">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="!flex-1 !min-w-0 !bg-transparent !h-12 !px-4 !text-[15px] !text-gray-900 !placeholder-gray-400 !outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="!space-y-1.5 !relative !group">
                        <label className="!text-xs !font-semibold !tracking-wide !text-gray-500 !ml-1">
                          Email
                        </label>
                        <div className="!relative !mt-1 !flex !items-stretch !rounded-xl !bg-gray-50 !border !border-gray-200 !overflow-hidden !transition-all hover:!bg-gray-100 focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-[#27427f]/20 focus-within:!border-[#27427f]">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="!flex-1 !min-w-0 !bg-transparent !h-12 !px-4 !text-[15px] !text-gray-900 !placeholder-gray-400 !outline-none"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mobile number field */}
                  <div className="!space-y-1.5 !relative !group">
                    <label className="!text-xs !font-semibold !tracking-wide !text-gray-500 !ml-1">
                      Mobile Number
                    </label>
                    <div className="!relative !mt-1 !flex !items-stretch !rounded-xl !bg-gray-50 !border !border-gray-200 !overflow-hidden !transition-all hover:!bg-gray-100 focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-[#27427f]/20 focus-within:!border-[#27427f]">
                      {/* Country code select */}
                      <div className="!relative !flex !shrink-0 !items-center !border-r !border-gray-200">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="!appearance-none !bg-transparent !h-12 !pl-3.5 !pr-7 !text-[14px] !font-semibold !text-gray-700 !outline-none !cursor-pointer"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+971">+971</option>
                          <option value="+61">+61</option>
                        </select>
                        <ChevronDown
                          size={13}
                          className="!absolute !right-1.5 !top-1/2 !-translate-y-1/2 !text-gray-400 !pointer-events-none"
                        />
                      </div>
                      {/* Phone input */}
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="90929 65556"
                        className="!flex-1 !min-w-0 !bg-transparent !h-12 !px-4 !text-[15px] !text-gray-900 !placeholder-gray-400 !outline-none"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* OTP field */}
                  <div className="!relative !group">
                    <div className="!relative !flex !items-stretch !rounded-xl !bg-gray-50 !border !border-gray-200 !overflow-hidden !transition-all hover:!bg-gray-100 focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-[#27427f]/20 focus-within:!border-[#27427f]">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="••••••"
                        className="!flex-1 !min-w-0 !bg-transparent !h-12 !px-4 !text-center !text-xl !font-semibold !tracking-[0.5em] !text-gray-900 !placeholder-gray-400 !outline-none"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Expiry countdown + resend. The backend owns expiry; this
                      countdown is cosmetic. */}
                  <div className="!flex !items-center !justify-between !text-[13px]">
                    <span
                      className="!font-medium !tabular-nums !text-gray-500"
                      aria-live="polite"
                    >
                      {expiresIn !== null && expiresIn > 0
                        ? `Expires in ${expiresIn}s`
                        : "Code expired"}
                    </span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendIn > 0 || loading}
                      className="!font-semibold !text-[#27427f] hover:!underline !transition-colors disabled:!opacity-50 disabled:!cursor-not-allowed disabled:hover:!no-underline"
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              {/* Submit */}
              <div className="!pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="!flex !h-12 !w-full !items-center !justify-center !gap-2 !rounded-xl !bg-[#27427f] !text-white !text-[15px] !font-semibold !shadow-[0_8px_20px_-6px_rgba(39,66,127,0.45)] !transition-all hover:!bg-[#1e3366] active:!scale-[0.98] disabled:!opacity-70 disabled:!cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="!animate-spin" />
                  ) : step === 1 ? (
                    "Send OTP"
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </div>

              {/* Footer */}
              <p className="!text-center !text-xs sm:!text-sm !font-medium !text-gray-500">
                By proceeding, you agree to our{" "}
                <a
                  href="#"
                  className="!font-semibold !text-[#27427f] hover:!underline !transition-colors"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="!font-semibold !text-[#27427f] hover:!underline !transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
