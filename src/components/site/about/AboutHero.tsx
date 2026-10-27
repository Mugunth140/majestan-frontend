import Image from "next/image";
import Link from "next/link";
import { Building2, Factory, House, Sprout } from "lucide-react";
import { SeoH1 } from "@/components/seo/core-heading";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { POST_PROPERTY_BUTTON, PostPropertyHover } from "@/components/site/shared/brand-cta";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}><Breadcrumbs items={[{ label: "About us" }]} /></div>
      <section className={styles.hero} aria-labelledby="about-heading">
        <div className={styles.heroCopy}>
          <SeoH1 id="about-heading" className={styles.title}>Property decisions, made with confidence.</SeoH1>
          <p className={styles.intro}>A home, a business space, a piece of land. We help you find the right property across India’s major tier 1 cities.</p>
          <p className={styles.body}>We bring property sales, leasing, management and liaisoning together, with local knowledge and a clear, personal approach at every step.</p>
          <div className={styles.actions}>
            <Link href="/contact-us" className={`${POST_PROPERTY_BUTTON} ${styles.primary}`}>
              <PostPropertyHover />Talk to our team
            </Link>
            <Link href="/projects" className={styles.textLink}>Explore projects</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.mainPhoto}>
            <Image src="/assets/images/section/about-1.png" alt="Contemporary buildings along a tree lined street" fill sizes="(max-width: 767px) 58vw, (max-width: 1023px) 50vw, 340px" preload className={styles.photo} />
          </div>
          <div className={styles.secondColumn}>
            <div className={styles.secondPhoto}>
              <Image src="/assets/images/section/about-2.png" alt="Residential buildings overlooking a green neighbourhood" fill sizes="(max-width: 767px) 38vw, (max-width: 1023px) 38vw, 230px" className={styles.photo} />
            </div>
          </div>
        </div>
      </section>
      <div className={styles.scopeStrip} aria-label="Our areas of expertise">
        <span>One team. A wider perspective.</span>
        <ul>
          <li><House size={20} aria-hidden="true" /><span>Residential</span></li>
          <li><Building2 size={20} aria-hidden="true" /><span>Commercial</span></li>
          <li><Factory size={20} aria-hidden="true" /><span>Industrial</span></li>
          <li><Sprout size={20} aria-hidden="true" /><span>Land &amp; farmlands</span></li>
        </ul>
      </div>
    </div>
  );
}
