"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Loader2, ChevronDown } from "lucide-react";
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
        <div className="!fixed !inset-0 !z-[9999] !flex !items-center !justify-center !p-4 sm:!p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="!absolute !inset-0 !bg-black/20 !backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="!relative !w-full !max-w-[420px] !overflow-hidden !rounded-4xl !bg-white/20 !backdrop-blur-lg !border !border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)!]"
          >
            {/* Subtle gloss highlights */}
            <div className="!absolute !-top-24 !-left-24 !w-48 !h-48 !rounded-full !bg-white/30 !blur-3xl !pointer-events-none" />
            <div className="!absolute !-bottom-24 !-right-24 !w-48 !h-48 !rounded-full !bg-blue-400/20 !blur-3xl !pointer-events-none" />

            <div className="!relative !z-10 !p-8 sm:!p-10">
              <div className="!mb-8 !text-center">
                <div className="!mx-auto !mb-5 !flex !h-16 !w-16 !items-center !justify-center !rounded-3xl !bg-white/40 !backdrop-blur-lg !border !border-white/50 !shadow-sm">
                  <Smartphone size={32} className="!text-[#27427f]" />
                </div>
                <h2 className="!text-3xl !font-normal !text-gray-900 !tracking-tight">Welcome to Majestan</h2>
                <p className="!mt-2.5 !text-[15px] !font-normal !text-gray-700/80">
                  Enter your mobile number to instantly access your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="!space-y-6">
                {error && (
                  <div className="!rounded-2xl !bg-rose-500/20 !backdrop-blur-md !border !border-rose-500/30 !p-4 !text-[14px] !font-medium !text-rose-900">
                    {error}
                  </div>
                )}

                <div className="!space-y-2.5">
                  <label className="!text-[14px] !font-semibold !text-gray-800">Mobile Number</label>
                  <div className="!flex !items-center !rounded-2xl !border !border-white/50 !bg-white/30 !backdrop-blur-md !shadow-inner focus-within:!ring-4 focus-within:!ring-blue-500/20 focus-within:!border-white/80 !transition-all !overflow-hidden">
                    <div className="!relative !flex !shrink-0 !items-center !h-full !bg-white/20 !min-w-[60px]">
                      <select 
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="!appearance-none !bg-transparent !py-4 !pl-4 !pr-10 !text-[15px] !font-semibold !text-gray-900 !outline-none !cursor-pointer !w-full !h-full !relative !z-10"
                      >
                        <option value="+91" className="!text-gray-900">+91 (IN)</option>
                        <option value="+1" className="!text-gray-900">+1 (US)</option>
                        <option value="+44" className="!text-gray-900">+44 (UK)</option>
                        <option value="+971" className="!text-gray-900">+971 (AE)</option>
                        <option value="+61" className="!text-gray-900">+61 (AU)</option>
                      </select>
                      <ChevronDown size={14} className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-gray-600 !pointer-events-none !z-20" />
                      <div className="!absolute !right-0 !top-4 !bottom-4 !w-px !bg-gray-400/40" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99999 99999"
                      className="!flex-1 !min-w-0 !bg-transparent !py-4 !px-4 !text-[16px] !font-sans !font-normal !tracking-wide !text-gray-800 !placeholder-gray-600/50 !outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="!flex !w-full !items-center !justify-center !gap-2 !rounded-2xl !bg-[#27427f]/90 !backdrop-blur-md !py-4 !text-[15px] !font-bold !tracking-wide !text-white shadow-[0_8px_20px_rgba(39,66,127,0.3)!] !transition-all hover:!bg-[#27427f] hover:shadow-[0_12px_24px_rgba(39,66,127,0.4)!] hover:!scale-[1.02] disabled:!opacity-70 disabled:hover:!scale-100"
                >
                  {loading ? (
                    <Loader2 size={22} className="!animate-spin" />
                  ) : (
                    <>
                      Continue
                    </>
                  )}
                </button>

                <p className="!text-center !text-[13px] !font-medium !text-gray-600/80">
                  By proceeding, you agree to our{" "}
                  <a href="#" className="!font-semibold !text-[#27427f] hover:!underline">Terms</a>{" "}
                  and{" "}
                  <a href="#" className="!font-semibold !text-[#27427f] hover:!underline">Privacy Policy</a>.
                </p>
              </form>
            </div>
          

            <button
              onClick={onClose}
              className="!absolute !right-5 !top-5 !z-50 !flex !h-9 !w-9 !cursor-pointer !items-center !justify-center !rounded-full !bg-white/30 !backdrop-blur-md !border !border-white/50 !text-gray-800 !transition-all hover:!bg-white/50 hover:!scale-105"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}