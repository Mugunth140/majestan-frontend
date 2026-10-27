import { ArticleCard } from "@/components/site/blog/article-card";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronRight } from "lucide-react";
import { PAGE_CONTAINER } from "@/components/site/project/project-ui";
import { notFound } from "next/navigation";
import { BLOG_SITE, blogFetch, type Post } from "@/lib/blog";
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ page?: string }> };
const pageNumber = (p?: string) => {
  if (p && !/^[1-9]\d*$/.test(p)) notFound();
  const n = Number(p || 1);
  if (!Number.isSafeInteger(n) || n > 100000) notFound();
  return n;
};
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const title = `Blogs: property insights${page > 1 ? ` · Page ${page}` : ""}`;
  const description =
    "Explore property guides, neighbourhood insights and practical real estate advice from the Majestan Realty team in Coimbatore.";
  const url = `${BLOG_SITE}/blogs${page > 1 ? `?page=${page}` : ""}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      siteName: "Majestan Realty",
      locale: "en_IN",
      title,
      description,
      url,
      type: "website",
      images: [`${BLOG_SITE}/assets/images/logo/logo.png`],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${BLOG_SITE}/assets/images/logo/logo.png`],
    },
  };
}
export default async function Blogs({ searchParams }: Props) {
  const page = pageNumber((await searchParams).page);
  const data = await blogFetch<{ items: Post[]; total: number; limit: number }>(
    `?page=${page}&limit=12`,
  );
  if (page > 1 && !data.items.length) notFound();
  return (
    <main
      id="main-content"
      className={`blog-shell blog-index ${PAGE_CONTAINER}`}
    >
      <nav aria-label="Breadcrumb" className="blog-crumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>Blogs</span>
      </nav>
      <header className="blog-masthead">
        <h1>Blogs</h1>
        <p>
          Local perspectives and practical guides for your next property
          decision.
        </p>
      </header>
      {data.items.length ? (
        <section aria-labelledby="latest-articles-heading">
          <div className="blog-section-heading">
            <h2 id="latest-articles-heading">Latest articles</h2>
            <span>
              {data.total} {data.total === 1 ? "article" : "articles"}
            </span>
          </div>
          <div className="journal-grid">
            {data.items.map((post, index) => (
              <ArticleCard post={post} key={post.id} eager={index < 2} />
            ))}
          </div>
        </section>
      ) : (
        <section className="blog-empty">
          <div className="blog-empty-icon">
            <BookOpen size={28} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2>Our journal is coming soon</h2>
          <p>
            Our team is preparing property guides and local insights. Explore
            our current listings while you’re here.
          </p>
          <Link className="blog-site-button" href="/projects">
            Explore our projects <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
      {data.total > 12 && (
        <nav className="blog-pagination" aria-label="Blog pages">
          {page > 1 && (
            <Link href={page === 2 ? "/blogs" : `/blogs?page=${page - 1}`}>
              ← Previous
            </Link>
          )}
          <span>
            Page {page} of {Math.ceil(data.total / 12)}
          </span>
          {page * 12 < data.total && (
            <Link href={`/blogs?page=${page + 1}`}>Next →</Link>
          )}
        </nav>
      )}
    </main>
  );
}
