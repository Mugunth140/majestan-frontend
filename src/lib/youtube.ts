/**
 * Extracts the 11-char YouTube video id from watch / embed / shorts /
 * live / youtu.be URLs. Returns null for anything else.
 */
export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const m = url
    .trim()
    .match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i,
    );
  return m ? m[1] : null;
}

export function youtubeEmbedUrl(videoId: string, autoplay = false): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
