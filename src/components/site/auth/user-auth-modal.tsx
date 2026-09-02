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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="!absolute !inset-0 !bg-black/50 !backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.18 }}
            className="!relative !w-full !max-w-[420px] !overflow-hidden !rounded-3xl !bg-white !shadow-2xl"
          >
            {/* Brand-blue top accent bar */}
            <div className="!h-1.5 !w-full !bg-[#27427f]" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="!absolute !right-4 !top-4 !z-50 !flex !h-8 !w-8 !cursor-pointer !items-center !justify-center !rounded-full !bg-gray-100 !text-gray-500 !transition-colors hover:!bg-gray-200 hover:!text-gray-800"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="!px-8 !pt-8 !pb-7">
              {/* Logo + heading */}
              <div className="!mb-7 !text-center">
                <div className="!mx-auto !mb-4 !flex !h-14 !w-14 !items-center !justify-center !rounded-2xl !bg-[#27427f]/8">
                  <Image
                    src="/favicon/favicon-32x32.png"
                    alt="Majestan"
                    width={32}
                    height={32}
                    className="!h-8 !w-8"
                    priority
                  />
                </div>
                <h2 className="!text-[22px] !font-bold !text-gray-900 !tracking-tight">
                  Sign in to Majestan
                </h2>
                <p className="!mt-1.5 !text-[14px] !text-gray-500">
                  Enter your mobile number to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className="!space-y-5">
                {/* Error */}
                {error && (
                  <div className="!rounded-xl !border !border-red-200 !bg-red-50 !px-4 !py-3 !text-[13px] !font-medium !text-red-700">
                    {error}
                  </div>
                )}

                {/* Phone input */}
                <div className="!space-y-2">
                  <label className="!block !text-[13px] !font-semibold !text-gray-700">
                    Mobile Number
                  </label>
                  <div className="!flex !items-stretch !overflow-hidden !rounded-xl !border !border-gray-200 !bg-white !transition-all focus-within:!border-[#27427f] focus-within:!ring-3 focus-within:!ring-[#27427f]/15">
                    {/* Country code */}
                    <div className="!relative !flex !shrink-0 !items-center !border-r !border-gray-200 !bg-gray-50">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="!appearance-none !bg-transparent !py-3.5 !pl-3.5 !pr-8 !text-[14px] !font-semibold !text-gray-800 !outline-none !cursor-pointer"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (AE)</option>
                        <option value="+61">+61 (AU)</option>
                      </select>
                      <ChevronDown
                        size={13}
                        className="!absolute !right-2 !top-1/2 !-translate-y-1/2 !text-gray-400 !pointer-events-none"
                      />
                    </div>
                    {/* Phone number */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99999 99999"
                      className="!flex-1 !min-w-0 !bg-transparent !py-3.5 !px-4 !text-[15px] !text-gray-900 !placeholder-gray-400 !outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="!flex !w-full !items-center !justify-center !gap-2 !rounded-xl !bg-[#27427f] !py-3.5 !text-[15px] !font-bold !text-white !transition-all hover:!bg-[#1e3366] disabled:!opacity-60 disabled:!cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="!animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>

                {/* Footer */}
                <p className="!text-center !text-[12px] !text-gray-400">
                  By proceeding, you agree to our{" "}
                  <a
                    href="#"
                    className="!font-semibold !text-[#27427f] hover:!underline"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="!font-semibold !text-[#27427f] hover:!underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
