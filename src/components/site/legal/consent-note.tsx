import Link from "next/link";

const link = "!font-semibold !text-[#27427f] hover:!underline !underline-offset-4";

/** One short line under forms that take a phone number: the terms, privacy and WhatsApp opt-in. */
export function ConsentNote({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      You agree to our <Link href="/terms-and-conditions" className={link}>Terms</Link>,{" "}
      <Link href="/privacy-policy" className={link}>Privacy Policy</Link> &amp;{" "}
      <Link href="/terms-and-conditions#whatsapp-updates" className={link}>WhatsApp updates</Link>
    </p>
  );
}
