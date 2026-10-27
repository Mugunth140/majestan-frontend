import { MapPinned, HeartHandshake, ShieldCheck } from "lucide-react";
import styles from "./about.module.css";

const VALUES = [
  { Icon: MapPinned, title: "Knowledge that stays local", description: "An understanding of Coimbatore’s neighbourhoods, business corridors and land markets helps us find options that fit your needs." },
  { Icon: ShieldCheck, title: "Clarity at every step", description: "Straightforward conversations about your options, the process and the next steps, so you can make an informed decision." },
  { Icon: HeartHandshake, title: "Your priorities come first", description: "A family home, a place for your business or an investment. We take the time to understand what matters to you." },
];

export function AboutValues() {
  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="about-values">
      <div className={styles.sectionHeader}>
        <div><p className={styles.eyebrow}>The way we work</p><h2 id="about-values" className={styles.heading}>Good property advice starts with trust.</h2></div>
        <p className={styles.sectionDescription}>These principles guide how we work with you, from the first conversation to what comes after.</p>
      </div>
      <div className={styles.valuesGrid}>
        {VALUES.map(({ Icon, title, description }, index) => (
          <article className={styles.valueCard} key={title}>
            <div className={styles.cardTop}><span className={styles.icon}><Icon size={24} aria-hidden="true" /></span><span className={styles.cardNumber}>0{index + 1}</span></div>
            <h3>{title}</h3><p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
