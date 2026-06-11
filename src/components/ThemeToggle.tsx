"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="!p-2 !rounded-full !text-gray-400 hover:!text-gray-600 hover:!bg-gray-50 dark:!bg-[#1c1d27] dark:!text-gray-300 dark:hover:!bg-[#262730] !transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
