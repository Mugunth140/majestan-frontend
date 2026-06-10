"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Loader2, ArrowRight } from "lucide-react";
import { useUserAuthStore } from "@/store/userAuthStore";
import { API_BASE_URL } from "@/lib/api";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserAuthModal({ isOpen, onClose }: UserAuthModalProps) {
  const [phone, setPhone] = useState("");
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
        body: JSON.stringify({ phone: cleanPhone }),
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
        <div className="fixed! inset-0! z-[999]! flex! items-center! justify-center! p-4! sm:p-0!">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute! inset-0! bg-black/40! backdrop-blur-sm!"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative! w-full! max-w-md! overflow-hidden! rounded-3xl! bg-white! shadow-[0_20px_60px_rgba(0,0,0,0.1)]!"
          >
            <button
              onClick={onClose}
              className="absolute! right-4! top-4! z-10! flex! h-8! w-8! items-center! justify-center! rounded-full! bg-gray-100! text-gray-500! transition-colors! hover:bg-gray-200! hover:text-gray-900!"
            >
              <X size={18} />
            </button>

            <div className="p-8! sm:p-10!">
              <div className="mb-8! text-center!">
                <div className="mx-auto! mb-4! flex! h-14! w-14! items-center! justify-center! rounded-full! bg-blue-50!">
                  <Smartphone size={28} className="text-blue-600!" />
                </div>
                <h2 className="text-2xl! font-semibold! text-gray-900! tracking-tight!">Welcome Back</h2>
                <p className="mt-2! text-[15px]! text-gray-500!">
                  Enter your mobile number to sign in or create a new account instantly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6!">
                {error && (
                  <div className="rounded-xl! bg-rose-50! p-4! text-[14px]! font-medium! text-rose-600!">
                    {error}
                  </div>
                )}

                <div className="space-y-2!">
                  <label className="text-[14px]! font-medium! text-gray-700!">Mobile Number</label>
                  <div className="relative!">
                    <div className="absolute! inset-y-0! left-0! flex! items-center! pl-4!">
                      <span className="text-[15px]! font-medium! text-gray-500!">+91</span>
                      <div className="mx-3! h-5! w-px! bg-gray-200!" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter 10-digit number"
                      className="w-full! rounded-xl! border! border-gray-200! bg-gray-50! py-3.5! pl-20! pr-4! text-[15px]! font-medium! text-gray-900! outline-none! transition-all! focus:border-blue-500! focus:bg-white! focus:ring-2! focus:ring-blue-500/20!"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex! w-full! items-center! justify-center! gap-2! rounded-xl! bg-blue-600! py-3.5! text-[15px]! font-medium! text-white! transition-all! hover:bg-blue-700! hover:shadow-[0_8px_20px_rgba(37,99,235,0.2)]! disabled:opacity-70!"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin!" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center! text-[13px]! text-gray-500!">
                  By proceeding, you agree to our{" "}
                  <a href="#" className="font-medium! text-blue-600! hover:underline!">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="font-medium! text-blue-600! hover:underline!">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}