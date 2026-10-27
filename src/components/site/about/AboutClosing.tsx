import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { POST_PROPERTY_BUTTON, PostPropertyHover } from "@/components/site/shared/brand-cta";
import styles from "./about.module.css";

export function AboutClosing() {
  return (
    <section className={`${styles.container} ${styles.closingWrap}`} aria-labelledby="about-next-step">
      <div className={styles.closing}>
        <div><p className={styles.eyebrow}>Your next chapter</p><h2 id="about-next-step">The right property.<br />The right people beside you.</h2><p>Tell us what you have in mind. Let&apos;s work out the next step together.</p></div>
        <Link href="/contact-us" className={`${POST_PROPERTY_BUTTON} ${styles.primary}`}><PostPropertyHover />Let&apos;s talk property<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
