"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RotatingWords({ words }: { words: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % words.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className="relative inline-flex flex-col overflow-hidden items-center justify-center bg-[#27427f]/5 px-1 py-1 rounded-2xl shadow-[inset_0_1.5px_4px_rgba(39,66,127,0.06)] mx-2 align-middle max-[640px]:px-4 max-[640px]:py-1 max-[640px]:rounded-xl">
      <AnimatePresence mode="wait">
        <motion.span
          key={activeIndex}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            y: { type: "spring", stiffness: 220, damping: 20 },
            opacity: { duration: 0.2 }
          }}
          className="absolute font-black text-[#ffc900] whitespace-nowrap"
        >
          {words[activeIndex]}
        </motion.span>
      </AnimatePresence>
      {/* Hidden spacer to reserve space so the text doesn't jitter or collapse */}
      <span className="opacity-0 font-black select-none pointer-events-none px-1">
        {words.reduce((a, b) => (a.length > b.length ? a : b), "")}
      </span>
    </span>
  );
}

