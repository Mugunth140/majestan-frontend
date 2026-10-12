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

export type ProjectVideo = { id: string; title: string | null };

/**
 * A project's playable videos, in CRM order: titled `videos` when present,
 * else the legacy `videoUrls`. Links that aren't YouTube, and repeats of the
 * same video, are dropped.
 */
export function projectVideos(project: {
  videos?: { title: string | null; url: string }[] | null;
  videoUrls?: string[] | null;
}): ProjectVideo[] {
  const source =
    project.videos && project.videos.length > 0
      ? project.videos
      : (project.videoUrls ?? []).map((url) => ({ title: null, url }));
  const seen = new Set<string>();
  const out: ProjectVideo[] = [];
  for (const video of source) {
    const id = getYouTubeVideoId(video.url);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, title: video.title?.trim() || null });
  }
  return out;
}
