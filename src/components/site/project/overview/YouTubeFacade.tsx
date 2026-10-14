"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * Click-to-load YouTube player. A live iframe pulls in roughly 1MB of YouTube
 * JavaScript on page load, and most visitors never press play. The thumbnail
 * is a plain image, so the embed is only fetched once someone asks to watch.
 *
 * The ring is inset on purpose: the box clips at its rounded edge, so an
 * outside ring would be cut off where it matters most.
 */
export function YouTubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="aspect-video! rounded-2xl! overflow-hidden! bg-gray-900! relative!">
      {playing ? (
        <iframe
          src={youtubeEmbedUrl(videoId, true)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute! inset-0! w-full! h-full! border-0!"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute! inset-0! w-full! h-full! cursor-pointer! transition-transform! duration-150! ease-out-quint! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-inset! focus-visible:ring-[#1645bf]!"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youtubeThumbnailUrl(videoId)}
            alt=""
            loading="lazy"
            className="block! w-full! h-full! object-cover!"
          />
          <span className="absolute! inset-0! grid! place-items-center!">
            <span className="w-16! h-16! rounded-full! bg-white/90! grid! place-items-center! transition-transform! duration-150! ease-out-quint! group-hover:scale-105!">
              <Play className="w-6! h-6! ml-0.5! text-gray-900! fill-gray-900!" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
