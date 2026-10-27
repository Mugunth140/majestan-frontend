"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import { LISTING_SUMMARY_CARD } from "./listing-summary-styles";
import styles from "./detail-enquiry-panel.module.css";

/** One enquiry island: a desktop sidebar and a non-modal mobile disclosure. */
export function DetailEnquiryPanel({
  title,
  price,
  children,
  actions,
  secondary,
  footer,
  listedBy,
}: {
  title: string;
  price: string;
  children: ReactNode;
  actions: ReactNode;
  secondary?: ReactNode;
  footer: ReactNode;
  listedBy: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => {
      // Reserve only the collapsed footprint, so expanding never moves the page.
      if (!expanded && window.innerWidth < 1024) {
        document.documentElement.style.setProperty(
          "--detail-enquiry-h", `${panel.getBoundingClientRect().height}px`,
        );
      }
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [expanded]);

  useEffect(() => () => {
    document.documentElement.style.removeProperty("--detail-enquiry-h");
  }, []);

  return (
    <div
      ref={panelRef}
      data-detail-enquiry
      data-expanded={expanded}
      className={styles.panel}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          event.stopPropagation();
          setExpanded(false);
          toggleRef.current?.focus();
        }
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={`${id}-details ${id}-footer ${id}-agent${secondary ? ` ${id}-secondary` : ""}`}
        aria-label={expanded ? "Collapse enquiry details" : "Expand enquiry details"}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className={styles.identity}>
          <span className={styles.title}>{title}</span>
          <span className={styles.price}>{price}</span>
        </span>
        <span className={styles.affordance}>
          {expanded ? "Less" : "Details"}
          <ChevronUp size={16} aria-hidden="true" />
        </span>
      </button>
      <div className={styles.body}>
        <div className={`${LISTING_SUMMARY_CARD} ${styles.card}`}>
          <div id={`${id}-details`} className={styles.details}>{children}</div>
          <div className={styles.actions}>{actions}</div>
          {secondary && <div id={`${id}-secondary`} className={styles.details}>{secondary}</div>}
          <div id={`${id}-footer`} className={styles.details}>{footer}</div>
        </div>
        <div id={`${id}-agent`} className={styles.agent}>{listedBy}</div>
      </div>
    </div>
  );
}
