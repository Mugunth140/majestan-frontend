"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Share2 } from "lucide-react";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import type { ProjectDetail } from "@/lib/api/projects";

/**
 * Back / share / save bar. Lifted out of ProjectDetailsView so the view itself
 * can be a server component — the old one shipped 660 lines of page markup to
 * the browser to hold a single `copied` boolean.
 */
export function ProjectTopActions({ project }: { project: ProjectDetail }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/${project.canonicalSlug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* dismissed the share sheet, or clipboard denied */
    }
  };

  return (
    <div className="flex! flex-wrap! items-center! justify-between! gap-4!">
      <Link
        href="/projects"
        className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-500! no-underline! rounded-md! transition-colors! duration-150! ease-out-quint! hover:text-gray-900! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
      >
        <ChevronLeft className="w-4! h-4!" />
        All projects
      </Link>

      <div className="flex! items-center! gap-3!">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex! items-center! gap-2! px-4! py-2! rounded-xl! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! shadow-sm! cursor-pointer! transition-[color,border-color,transform]! duration-150! ease-out-quint! hover:border-gray-300! hover:text-gray-900! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
        >
          {copied ? (
            <Check className="w-4! h-4! text-emerald-600!" />
          ) : (
            <Share2 className="w-4! h-4!" />
          )}
          <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
        </button>
        <WishlistButton
          propertyId={project.id}
          propertyType="project"
          variant="pill"
        />
      </div>
    </div>
  );
}
