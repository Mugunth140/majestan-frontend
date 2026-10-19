import styles from "./listing-card.module.css";

export function ListingConditionBadge({ label, className = "" }: { label: string | null; className?: string }) {
  if (!label) return null;
  return (
    <span className={`${styles.badgeWrap} ${className}`}>
      <span className={styles.badge}>{label}</span>
      <span className={styles.badgeFold} aria-hidden="true" />
    </span>
  );
}
