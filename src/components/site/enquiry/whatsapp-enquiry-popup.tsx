"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, MessageCircle } from "lucide-react";
import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import { parsePseoSlug } from "@/lib/seo-urls";

export function WhatsAppPopup({
  pageUrl,
  listingType,
  propertyType,
  location,
}: {
  pageUrl: string;
  listingType?: string;
  propertyType?: string;
  location?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusables = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])'
        )
      ).filter((el) => el.tabIndex !== -1);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !cardRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg("Please enter your name.");
      setStatus("error");
      return;
    }
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await createEnquiry({
        name: trimmed,
        phone: normalized,
        source: "whatsapp_popup",
        pageUrl: pageUrl + window.location.search,
        listingType,
        propertyType,
        location,
        whatsappOptIn: true,
      });
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      {open && (
        <button
          aria-label="Close popup"
          onClick={() => setOpen(false)}
          className="fixed! inset-0! z-[9998]! cursor-default!"
        />
      )}
    <div className="fixed! bottom-6! right-5! z-[9999]! flex! flex-col! items-end! gap-3!">
      {/* Expanded card */}
      {open && (
        <div
          ref={cardRef}
          className="w-[300px]! bg-white! rounded-2xl! shadow-[0_8px_40px_rgba(0,0,0,0.18)]! border! border-gray-100! overflow-hidden! animate-in! fade-in! slide-in-from-bottom-4! duration-200!"
        >
          {/* Header */}
          <div className="flex! items-center! justify-between! px-4! py-3! bg-[#27427f]!">
            <div className="flex! items-center! gap-2!">
              <MessageCircle className="w-4! h-4! text-white! fill-white!" />
              <span className="text-[13px]! font-semibold! text-white! font-['Manrope',sans-serif]!">
                Get Details via WhatsApp
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/70! hover:text-white! transition-colors! cursor-pointer!"
            >
              <X className="w-4! h-4!" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4! flex! flex-col! gap-3!">
            {status === "success" ? (
              <p className="text-[13px]! text-blue-950! font-medium! leading-relaxed! py-2! font-['Manrope',sans-serif]!">
                Thanks {name.trim().split(" ")[0] || "there"}! Our team will reach out to you shortly.
              </p>
            ) : (
              <form
                className="flex! flex-col! gap-2.5!"
                onSubmit={handleSubmit}
              >
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full! p-3! text-sm! border! border-gray-200! rounded-lg! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-gray-400! font-['Manrope',sans-serif]!"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  required
                  pattern="[0-9+ ]{10,15}"
                  className="w-full! p-3! text-sm! border! border-gray-200! rounded-lg! outline-none! focus:ring-2! focus:ring-[#27427f]/20! focus:border-[#27427f]! placeholder:text-gray-400! font-['Manrope',sans-serif]!"
                />
                {status === "error" && errorMsg && (
                  <p className="text-[12px]! text-red-600! font-medium! font-['Manrope',sans-serif]!">
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex! items-center! justify-center! gap-2! w-full! py-2.5! bg-[#27427f]! text-white! text-sm! font-semibold! rounded-xl! cursor-pointer! hover:bg-[#1a2d59]! transition-colors! disabled:opacity-60! disabled:cursor-not-allowed! font-['Manrope',sans-serif]!"
                >
                  {status === "submitting" ? "Requesting..." : "Request Callback"}
                </button>
                <p className="text-[11px]! text-gray-500! text-center! leading-relaxed! font-['Manrope',sans-serif]!">
                  By enquiring, you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#27427f]! font-semibold! hover:underline!"
                  >
                    Terms &amp; Conditions.
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Trigger pill — only visible when popup is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Get Details via WhatsApp"
          className="flex! items-center! gap-2! px-4! py-4! bg-[#27427f]! text-white! text-[13px]! font-semibold! rounded-full! shadow-lg! hover:bg-[#1a2d59]! transition-all! duration-200! cursor-pointer! font-['Manrope',sans-serif]! whitespace-nowrap!"
        >
          <MessageCircle className="w-5! h-5! shrink-0! fill-white!" />
          {/* Get Details via WhatsApp */}
        </button>
      )}
    </div>
    </>
  );
}

const HIDDEN_PREFIXES = ["/admin", "/login", "/register"];

/**
 * Site-wide floating WhatsApp enquiry button. Render once in the root layout.
 * Skips auth/admin screens, and skips PSEO listing pages because ListingShell
 * already renders its own contextual instance (with listing filters) there —
 * so exactly one icon is ever on screen.
 */
export function GlobalWhatsAppEnquiry() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  if (slug && !slug.includes("/") && parsePseoSlug(slug)) {
    return null;
  }
  return <WhatsAppPopup pageUrl={pathname} />;
}
