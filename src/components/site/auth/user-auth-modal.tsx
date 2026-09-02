"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronDown } from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import { API_BASE_URL } from "@/lib/api";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserAuthModal({ isOpen, onClose }: UserAuthModalProps) {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useUserAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/user/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, phone: cleanPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to authenticate");
      }

      if (data.data?.accessToken && data.data?.user) {
        login(data.data.accessToken, data.data.user);
        onClose();
        setPhone("");
      } else if (data.accessToken && data.user) {
        login(data.accessToken, data.user);
        onClose();
        setPhone("");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
            className="!relative !w-full !max-w-[480px] !flex !flex-col !justify-center !p-8 sm:!p-10 md:!p-12 !bg-white/95 !backdrop-blur-xl !rounded-[2rem] sm:!rounded-[2.5rem] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] !border !border-white/50"
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
            <div className="!mb-8 sm:!mb-10 !flex !items-center !justify-center">
              <Image
                src="/assets/images/logo/logo.png"
                alt="Majestan Realty"
                width={64}
                height={64}
                className="!object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <div className="!mb-8 sm:!mb-10">
              <h1 className="!mb-2 !text-2xl sm:!text-3xl md:!text-4xl !font-bold !tracking-tight !text-gray-900 !text-center">
                Welcome back
              </h1>
              <p className="!text-[14px] sm:!text-[15px] !text-gray-500 !mt-2 sm:!mt-3 !text-center !leading-relaxed">
                Enter your mobile number to instantly access your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="!space-y-5 sm:!space-y-6">
              {/* Error */}
              {error && (
                <div className="!rounded-xl !border !border-red-200 !bg-red-50 !px-4 !py-3 !text-[13px] !font-medium !text-red-700">
                  {error}
                </div>
              )}

              {/* Mobile number field */}
              <div className="!space-y-1.5 !relative !group">
                <label className="!text-xs !font-semibold !tracking-wide !text-gray-500 !ml-1">
                  Mobile Number
                </label>
                <div className="!relative !mt-1 !flex !items-stretch !h-12 sm:!h-14 !rounded-xl !bg-gray-50 !border !border-gray-200 !overflow-hidden !transition-all hover:!bg-gray-100 focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-[#27427f]/20 focus-within:!border-[#27427f]">
                  {/* Country code select */}
                  <div className="!relative !flex !shrink-0 !items-center !border-r !border-gray-200 !bg-transparent">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="!h-full !appearance-none !bg-transparent !pl-4 !pr-7 !text-[15px] !font-semibold !text-gray-700 !outline-none !cursor-pointer"
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
                    placeholder="99999 99999"
                    className="!flex-1 !min-w-0 !bg-transparent !px-4 !text-[15px] !text-gray-900 !placeholder-gray-400 !outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="!pt-2 sm:!pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="!flex !h-12 sm:!h-14 !w-full !items-center !justify-center !gap-2 !rounded-xl !bg-[#27427f] !text-white !text-[15px] !font-semibold !shadow-[0_8px_20px_-6px_rgba(39,66,127,0.45)] !transition-all hover:!bg-[#1e3366] active:!scale-[0.98] disabled:!opacity-70 disabled:!cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="!animate-spin" />
                  ) : (
                    "Continue"
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
