"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import type { ProjectDetail } from "@/lib/api/projects";

/**
 * Share / save controls. Rendered in the breadcrumb row by the page rather than
 * inside the view, so the view can stay a server component — the old one
 * shipped 660 lines of page markup to the browser to hold a single `copied`
 * boolean. The label drops on phones so the row doesn't crowd the breadcrumb
 * trail; the icon and aria-label carry the action there.
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
    <div className="flex! items-center! gap-2! shrink-0!">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        className="inline-flex! items-center! gap-2! px-4! py-2! rounded-2xl! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! shadow-sm! cursor-pointer! transition-[color,border-color,transform]! duration-150! ease-out-quint! hover:border-gray-300! hover:text-gray-900! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#1645bf]! focus-visible:ring-offset-2!"
      >
        {copied ? (
          <Check className="w-4! h-4! text-emerald-600!" />
        ) : (
          <Share2 className="w-4! h-4!" />
        )}
        <span aria-hidden="true" className="hidden! sm:inline!">
          {copied ? "Link copied" : "Share"}
        </span>
        {/* The visible label is display:none on phones, and a live region
            inside a hidden element is never announced. This one is always
            in the accessibility tree and only speaks when the copy lands. */}
        <span aria-live="polite" className="sr-only!">
          {copied ? "Link copied" : ""}
        </span>
      </button>
      <WishlistButton
        propertyId={project.id}
        propertyType="project"
        variant="pill"
        radius="rounded-2xl!"
      />
    </div>
  );
}
