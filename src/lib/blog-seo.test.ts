import { describe, expect, it } from "vitest";
import { blogSeo } from "./blog-seo";
const post = {
  title: "Buying a home in Coimbatore",
  excerpt: "A practical guide to buying your next home.",
  meta_title: "",
  meta_description: "",
  social_image: "",
  cover_image: "https://cdn.example.com/home.jpg",
  cover_alt: "A house with a garden",
};
describe("Blog SEO fallbacks", () => {
  it("shortens long fallback snippets at a word boundary without changing article copy", () => {
    const record = {
      ...post,
      excerpt: "A practical guide to buying a home in Coimbatore. ".repeat(10),
    };
    const seo = blogSeo(record);
    expect(seo.description.length).toBeLessThanOrEqual(160);
    expect(seo.description).toMatch(/…$/);
    expect(record.excerpt.length).toBeGreaterThan(160);
    expect(blogSeo(post).description).toBe(post.excerpt);
  });
  it("honors explicit SEO copy and ignores whitespace-only overrides", () => {
    expect(
      blogSeo({
        ...post,
        meta_title: " Custom title ",
        meta_description: " Custom description ",
      }),
    ).toMatchObject({
      title: "Custom title",
      description: "Custom description",
    });
    expect(
      blogSeo({ ...post, meta_title: "  ", meta_description: " \n " }),
    ).toMatchObject({ title: post.title, description: post.excerpt });
  });
  it("keeps social-image alt text associated with the selected image", () => {
    expect(blogSeo(post)).toMatchObject({
      image: post.cover_image,
      imageAlt: post.cover_alt,
    });
    expect(
      blogSeo({ ...post, social_image: "https://cdn.example.com/share.jpg" }),
    ).toMatchObject({
      image: "https://cdn.example.com/share.jpg",
      imageAlt: post.title,
    });
    expect(blogSeo({ ...post, cover_alt: " " }).imageAlt).toBe(post.title);
  });
  it("normalizes keyword lists without duplicating case variants or empty terms", () => {
    expect(
      blogSeo({
        ...post,
        meta_keywords: " Buying guides, Coimbatore homes, buying GUIDES, , ",
      }).keywords,
    ).toEqual(["Buying guides", "Coimbatore homes"]);
    expect(blogSeo(post).keywords).toEqual([]);
  });
});
