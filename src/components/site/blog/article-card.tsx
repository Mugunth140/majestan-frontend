import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Post } from "@/lib/blog";
export function ArticleCard({
  post,
  eager = false,
}: {
  post: Post;
  eager?: boolean;
}) {
  const url = `/blogs/${post.slug}`;
  const date = new Date(post.published_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  return (
    <article className="journal-card">
      <Link
        href={url}
        className="journal-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.cover_alt}
            width={1200}
            height={750}
            loading={eager ? "eager" : "lazy"}
          />
        ) : (
          <div className="journal-image-empty">
            <BookOpen size={40} strokeWidth={1} />
          </div>
        )}
      </Link>
      <div className="journal-content">
        <h2>
          <Link href={url}>{post.title}</Link>
        </h2>
        <div className="journal-meta">
          <span>{post.category || "Property insights"}</span>
          <time dateTime={post.published_at}>{date}</time>
        </div>
      </div>
    </article>
  );
}
