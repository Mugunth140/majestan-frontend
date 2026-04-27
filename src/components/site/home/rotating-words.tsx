"use client";

import { useEffect, useState } from "react";

export function RotatingWords({ words }: { words: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % words.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [words.length]);

  return (
    <span className="rotate-words" aria-live="polite">
      {words.map((word, index) => (
        <span className={index === activeIndex ? "active" : undefined} key={word}>
          {word}
        </span>
      ))}
    </span>
  );
}
