/** Shared by article metadata and the site-admin preview. No browser/server dependencies. */
export function blogSeo(post: {
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  cover_image: string;
  cover_alt: string;
  social_image: string;
}) {
  const title = post.meta_title.trim() || post.title.trim();
  const summary = post.excerpt.replace(/\s+/g, " ").trim();
  // Keep automatic snippets compact without shortening the visible description.
  const shortened = summary.length > 160 ? summary.slice(0, 159) : summary;
  const boundary = shortened.lastIndexOf(" ");
  const fallback =
    summary.length > 160
      ? `${boundary > 0 ? shortened.slice(0, boundary) : shortened}…`
      : summary;
  const description = post.meta_description.trim() || fallback;
  const image = post.social_image.trim() || post.cover_image;
  const customImage = !!post.social_image.trim() && image !== post.cover_image;
  const imageAlt = customImage
    ? title
    : post.cover_alt.trim() || post.title.trim();
  const seen = new Set<string>();
  const keywords = (post.meta_keywords || "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => {
      const key = keyword.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return { title, description, image, imageAlt, keywords };
}
