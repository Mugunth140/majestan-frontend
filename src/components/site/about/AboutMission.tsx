import { Compass, Flag } from "lucide-react";
import styles from "./about.module.css";

export function AboutMission() {
  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="about-story">
      <div className={styles.storyPanel}>
        <div>

          <h2 id="about-story" className={styles.heading}>Property expertise across cities.</h2>
          <p className={styles.body}>Majestan Realty works with buyers, sellers, owners and investors across residential, commercial, industrial and agricultural property markets in India’s major tier 1 cities.</p>
          <p className={styles.body}>From finding a home or a suitable business location to managing a property and coordinating approvals, we look at the whole picture. Our role is to help you understand your options and move forward with clarity.</p>
        </div>
        <div className={styles.missionStack}>
          <article className={styles.missionCard}>
            <span className={styles.icon}><Compass size={22} aria-hidden="true" /></span>
            <div><h3>Our vision</h3><p>To be a trusted real estate partner across India’s major cities, bringing local understanding to a wider range of property needs.</p></div>
          </article>
          <article className={styles.missionCard}>
            <span className={styles.icon}><Flag size={22} aria-hidden="true" /></span>
            <div><h3>Our mission</h3><p>To make property transactions and ownership easier through clear communication, practical guidance and comprehensive support.</p></div>
          </article>
        </div>
      </div>
    </section>
  );
}
