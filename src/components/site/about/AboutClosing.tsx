import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { DETAILS } from "@/components/site/contact/content";
import { POST_PROPERTY_BUTTON, PostPropertyHover } from "@/components/site/shared/brand-cta";
import styles from "./about.module.css";

export function AboutClosing() {
  return (
    <section className={`${styles.container} ${styles.closingWrap}`} aria-labelledby="about-next-step">
      <div className={styles.closing}>
        <div className={styles.contactPhoto}>
          <Image
            src="/assets/images/section/contact1.png"
            alt="Contemporary office towers viewed from street level"
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 32vw, 350px"
            className={styles.photo}
          />
        </div>
        <div className={styles.contactContent}>
          <h2 id="about-next-step">Speak with our team</h2>
          <p>Buying, selling or managing a property? Tell us the city and what you need help with.</p>
          <div className={styles.contactChannels}>
            <a href={DETAILS.phone.href} className={styles.contactChannel}>
              <span className={styles.icon}><Phone size={20} aria-hidden="true" /></span>
              <span><span className={styles.contactLabel}>Call us</span><span className={styles.contactValue}>{DETAILS.phone.value}</span></span>
            </a>
            <a href={DETAILS.email.href} className={styles.contactChannel}>
              <span className={styles.icon}><Mail size={20} aria-hidden="true" /></span>
              <span><span className={styles.contactLabel}>Email us</span><span className={styles.contactValue}>{DETAILS.email.value}</span></span>
            </a>
          </div>
          <div className={styles.contactAction}>
            <Link href="/contact-us" className={`${POST_PROPERTY_BUTTON} ${styles.primary}`}>
              <PostPropertyHover />Send an enquiry
            </Link>
            <p>Prefer to write? Share your requirements with us.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
