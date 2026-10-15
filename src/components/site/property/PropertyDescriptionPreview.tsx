"use client";

import { useId, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { TEXT_LINK } from "@/components/site/project/project-ui";
import { formatDescriptionParagraphs } from "@/lib/property-format";

function safeDescription(value: string) {
  return sanitizeHtml(formatDescriptionParagraphs(value), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
  });
}

export function PropertyDescriptionPreview({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const fullHtml = safeDescription(description);
  const firstParagraph = /<p\b[^>]*>[\s\S]*?<\/p>/i.exec(fullHtml);
  const previewHtml = firstParagraph?.[0] ?? fullHtml;
  const previewContent = firstParagraph
    ? previewHtml.replace(/^<p\b[^>]*>/i, "").replace(/<\/p>$/i, "")
    : null;
  const hasMore = firstParagraph
    ? fullHtml.slice(firstParagraph.index + firstParagraph[0].length).replace(/<[^>]*>/g, "").trim().length > 0
    : false;

  return (
    <>
      {expanded ? (
        <div
          id={contentId}
          className="mt-4! text-gray-500! font-normal! leading-relaxed! [&_p]:m-0! [&_p+p]:mt-4! [&_img]:max-w-full! [&_img]:h-auto! [&_h1]:text-xl! [&_h1]:font-semibold! [&_h1]:text-gray-900! [&_h2]:text-lg! [&_h2]:font-semibold! [&_h2]:text-gray-900! [&_ul]:list-disc! [&_ul]:pl-5! [&_li]:mb-2!"
          dangerouslySetInnerHTML={{ __html: fullHtml }}
        />
      ) : previewContent !== null ? (
        <p
          id={contentId}
          className="mt-4! text-gray-500! font-normal! leading-relaxed!"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      ) : (
        <div
          id={contentId}
          className="mt-4! text-gray-500! font-normal! leading-relaxed!"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
      {hasMore && (
        <button
          type="button"
          aria-controls={contentId}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className={`${TEXT_LINK} mt-3! inline-flex! text-sm! font-semibold!`}
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}
    </>
  );
}
