"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { createEnquiry } from "@/lib/api";
import { normalizeIndianPhone } from "@/lib/validate-phone";
import styles from "./legal-page.module.css";

/** Opt-in for WhatsApp updates: a mobile number and an unticked consent box. */
export function WhatsappUpdatesForm() {
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const number = normalizeIndianPhone(phone);
    if (!number) return setError("Enter a valid 10-digit mobile number.");
    if (!agreed) return setError("Tick the box to agree to WhatsApp updates.");
    setError("");
    setStatus("submitting");
    try {
      await createEnquiry({
        name: "",
        phone: number,
        source: "whatsapp_updates",
        pageUrl: window.location.pathname,
        whatsappOptIn: true,
      });
      setStatus("done");
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
    }
  }

  if (status === "done")
    return (
      <div className={styles.optIn} role="status">
        <p className={styles.optInDone}>
          <CheckCircle2 size={20} aria-hidden="true" /> You’re subscribed. We’ll send updates to +91 {normalizeIndianPhone(phone)} on WhatsApp. Reply STOP any time to opt out.
        </p>
      </div>
    );

  return (
    <form className={styles.optIn} onSubmit={submit} noValidate aria-labelledby="whatsapp-optin-title">
      <h3 id="whatsapp-optin-title"><MessageCircle size={20} aria-hidden="true" /> Get updates on WhatsApp</h3>
      <label className={styles.optInField}>
        <span>Mobile number</span>
        <span className={styles.optInPhone}>
          <span aria-hidden="true">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            maxLength={14}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={error.startsWith("Enter") || undefined}
            required
          />
        </span>
      </label>
      <label className={styles.optInCheck}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
        <span>I agree to receive updates via WhatsApp.</span>
      </label>
      {error && <p className={styles.optInError} role="alert">{error}</p>}
      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
