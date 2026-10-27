import Link from "next/link";
import { Building2, Factory, House, LandPlot, KeyRound, FileCheck2 } from "lucide-react";
import styles from "./about.module.css";

const SERVICES = [
  { Icon: House, title: "Homes & residential spaces", description: "Apartments and villas for your next chapter.", href: "/apartments-for-sale-in-coimbatore" },
  { Icon: Building2, title: "Commercial properties", description: "Spaces that give your business room to grow.", href: "/commercial-spaces-for-sale-in-coimbatore" },
  { Icon: Factory, title: "Industrial properties", description: "Property options for manufacturing and operations.", href: "/industrial-spaces-for-sale-in-coimbatore" },
  { Icon: LandPlot, title: "Plots & farmlands", description: "Land for your plans, from a home to agriculture.", href: "/plots-for-sale-in-coimbatore" },
  { Icon: KeyRound, title: "Property management", description: "Support for the everyday responsibilities of ownership.", href: "/services/property-management" },
  { Icon: FileCheck2, title: "Liaisoning services", description: "Guidance through property approvals and coordination.", href: "/services/liaisoning" },
];

export function AboutServices() {
  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="about-services">
      <div className={styles.sectionHeader}>
        <div><h2 id="about-services" className={styles.heading}>More than finding a property.</h2></div>
        <p className={styles.sectionDescription}>Practical support for buying, selling, leasing and looking after your property.</p>
      </div>
      <div className={styles.servicesGrid}>
        {SERVICES.map(({ Icon, title, description, href }) => (
          <Link href={href} key={title} className={styles.serviceCard}>
            <span className={styles.icon}><Icon size={22} aria-hidden="true" /></span>
            <div><h3>{title}</h3><p>{description}</p></div>

          </Link>
        ))}
      </div>
      <p className={styles.landNote}>Looking for agricultural land? <Link href="/farmlands-for-sale-in-coimbatore">Explore farmlands</Link></p>
    </section>
  );
}
