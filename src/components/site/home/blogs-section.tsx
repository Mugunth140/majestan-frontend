"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Post } from "@/lib/blog";
import styles from "./blogs-section.module.css";

export function BlogsSection({ articles }: { articles: Post[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const previous = element.scrollLeft > 4;
      const next =
        element.scrollLeft + element.clientWidth < element.scrollWidth - 4;
      setEdges((current) =>
        current.previous === previous && current.next === next
          ? current
          : { previous, next },
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [articles.length]);

  function move(direction: -1 | 1) {
    const element = track.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    const distance =
      card.getBoundingClientRect().width +
      parseFloat(getComputedStyle(element).columnGap);
    element.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  if (!articles.length) return null;

  return (
    <section className={styles.section} aria-labelledby="home-blog-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h2 id="home-blog-heading" className={styles.heading}>
              Blogs
            </h2>
            <p className={styles.subtitle}>
              Local insights for your next property decision.
            </p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.viewAll} href="/blogs">
              View all blogs <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <div className={styles.arrows}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => move(-1)}
                disabled={!edges.previous}
                aria-label="Previous blogs"
                aria-controls="home-blog-track"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => move(1)}
                disabled={!edges.next}
                aria-label="Next blogs"
                aria-controls="home-blog-track"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>
        <div
          ref={track}
          id="home-blog-track"
          className={styles.track}
          role="region"
          aria-label="Latest blog articles"
          tabIndex={0}
        >
          {articles.map((article) => (
            <article key={article.id} className={styles.card}>
              <Link href={`/blogs/${article.slug}`} className={styles.cardLink}>
                <div className={styles.image}>
                  {article.cover_image ? (
                    <img
                      src={article.cover_image}
                      alt={article.cover_alt}
                      width={800}
                      height={450}
                      loading="lazy"
                    />
                  ) : (
                    <BookOpen size={32} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{article.title}</h3>
                  <div className={styles.meta}>
                    <span className={styles.category}>
                      {article.category || "Property insights"}
                    </span>
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Kolkata",
                        },
                      )}
                    </time>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
