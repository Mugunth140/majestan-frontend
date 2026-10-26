import { CopyArticleLink } from "@/components/site/blog/copy-article-link";
import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_CONTAINER } from "@/components/site/project/project-ui";
import {
  articleContent,
  BLOG_SITE,
  getPost,
  isoDate,
  ld,
  postUrl,
  readableDate,
} from "@/lib/blog";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  const title = post.meta_title || post.title,
    description = post.meta_description || post.excerpt;
  const image = post.social_image || post.cover_image;
  return {
    title: { absolute: `${title} | Majestan Realty` },
    description,
    keywords: [],
    alternates: { canonical: postUrl(post.slug) },
    authors: [{ name: post.author_name }],
    robots: {
      index: !post.noindex,
      follow: true,
      googleBot: {
        index: !post.noindex,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: postUrl(post.slug),
      publishedTime: isoDate(post.published_at),
      modifiedTime: isoDate(post.updated_at),
      authors: [post.author_name],
      section: post.category,
      images: image ? [{ url: image, alt: post.cover_alt }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
export default async function Article({ params }: Props) {
  const post = await getPost((await params).slug);
  const { content, headings } = articleContent(post.content);
  const words = content
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const url = postUrl(post.slug);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: url,
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image ? [post.cover_image] : [],
        datePublished: isoDate(post.published_at),
        dateModified: isoDate(post.updated_at),
        author: {
          "@type": "Organization",
          name: post.author_name,
        },
        publisher: {
          "@type": "Organization",
          name: "Majestan Realty",
          url: BLOG_SITE,
          logo: {
            "@type": "ImageObject",
            url: `${BLOG_SITE}/assets/images/logo/logo.png`,
          },
        },
        articleSection: post.category,
        inLanguage: "en-IN",
        wordCount: words,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BLOG_SITE },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blogs",
            item: `${BLOG_SITE}/blogs`,
          },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
  return (
    <main
      id="main-content"
      className={`blog-shell blog-detail ${PAGE_CONTAINER}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(schema) }}
      />
      <article>
        <header className="blog-article-header">
          <Link className="blog-read blog-back" href="/blogs">
            ← All articles
          </Link>
          {post.cover_image && (
            <img
              className="blog-hero-image"
              src={post.cover_image}
              alt={post.cover_alt}
              width={1200}
              height={675}
              fetchPriority="high"
            />
          )}
          {post.category && <p className="blog-eyebrow">{post.category}</p>}
          <h1>{post.title}</h1>
          {post.excerpt && <p className="blog-deck">{post.excerpt}</p>}
        </header>
        <div className="blog-article-meta">
          <div className="blog-byline">
            <time dateTime={post.published_at}>
              {readableDate(post.published_at)}
            </time>
            <span>{Math.max(1, Math.ceil(words / 200))} min read</span>
          </div>
          <div className="blog-share">
            <CopyArticleLink url={url} />
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ↗
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
        <div
          className={`blog-article-grid${headings.length ? "" : " blog-article-no-contents"}`}
        >
          {headings.length > 0 && (
            <aside className="blog-article-sidebar">
              <nav className="blog-contents" aria-label="Table of contents">
                <h2>Table of contents</h2>
                <ul>
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
          <div className="blog-article-body">
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <footer className="blog-article-footer">
              <div className="blog-share">
                <span>Share article</span>
                <CopyArticleLink url={url} />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp ↗
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}`}
                >
                  Email ↗
                </a>
              </div>
              <p className="blog-updated">
                Last updated{" "}
                <time dateTime={post.updated_at}>
                  {readableDate(post.updated_at)}
                </time>
              </p>
            </footer>
          </div>
        </div>
      </article>
    </main>
  );
}
