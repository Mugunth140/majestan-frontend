import { cache } from "react";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { SEO_API_BASE } from "./seo-api-base";
export const BLOG_SITE = "https://www.majestanrealty.com";
export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  category: string;
  cover_image: string;
  cover_alt: string;
  meta_title: string;
  meta_description: string;
  social_image: string;
  noindex: boolean;
  published_at: string;
  updated_at: string;
};
export const blogFetch = cache(async <T>(path: string): Promise<T> => {
  const res = await fetch(SEO_API_BASE + "/editorial" + path, {
    cache: "no-store",
    headers: process.env.INTERNAL_API_KEY
      ? { "x-internal-key": process.env.INTERNAL_API_KEY }
      : {},
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Blog temporarily unavailable");
  return (await res.json()).data;
});
export const getPost = (slug: string) =>
  blogFetch<Post>("/posts/" + encodeURIComponent(slug));
export const postUrl = (slug: string) => `${BLOG_SITE}/blogs/${slug}`;
export const isoDate = (value: string) => new Date(value).toISOString();
export function readableDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
export function articleContent(html: string) {
  let index = 0;
  const headings: { id: string; title: string }[] = [];
  const content = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "code",
      "hr",
      "sup",
      "sub",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      h2: ["id", "style"],
      h3: ["id", "style"],
      h4: ["style"],
      p: ["style"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedStyles: { "*": { "text-align": [/^(left|center|right|justify)$/] } },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: {
      h2: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, id: `section-${++index}` },
      }),
      h3: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, id: `section-${++index}` },
      }),
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          alt: attribs.alt || "",
          loading: "lazy",
          decoding: "async",
        },
      }),
    },
  });
  for (const match of content.matchAll(
    /<h[23][^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/g,
  )) {
    headings.push({
      id: match[1],
      title: sanitizeHtml(match[2], { allowedTags: [], allowedAttributes: {} })
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">"),
    });
  }
  return { content, headings };
}
export const ld = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
