"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Heading,
  Text,
  TextField,
  TextArea,
  Switch,
  Table,
  Flex,
  Badge,
  Skeleton,
} from "@radix-ui/themes";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { seoApi } from "../seo-admin-shell";
import { blogSeo } from "@/lib/blog-seo";
import { OgImageUpload } from "../og-image-upload";
import "./blogs-admin.css";
type BlogSeo = {
  id: number;
  revision: number;
  title: string;
  excerpt: string;
  slug: string;
  status: string;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  social_image: string;
  cover_image: string;
  cover_alt: string;
  noindex: boolean;
};
export default function BlogsAdmin() {
  const [page, setPage] = useState(1),
    [rows, setRows] = useState<BlogSeo[]>([]),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogSeo | null>(null),
    [saved, setSaved] = useState(""),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const effectiveSeo = post ? blogSeo(post) : null;
  const dirty = !!post && JSON.stringify(post) !== saved;
  useEffect(() => {
    let live = true;
    seoApi(`blogs?page=${page}`)
      .then((data) => {
        if (live) {
          setRows(data.items);
          setTotal(data.total);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, [page]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  const open = async (id: number) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await seoApi(`blogs/${id}`);
      setPost(data);
      setSaved(JSON.stringify(data));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const change = <K extends keyof BlogSeo>(key: K, value: BlogSeo[K]) =>
    setPost((prev) => (prev ? { ...prev, [key]: value } : prev));
  const save = async () => {
    if (!post) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await seoApi(
        `blogs/${post.id}`,
        {
          slug: post.slug,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          meta_keywords: post.meta_keywords || "",
          social_image: post.social_image,
          noindex: post.noindex,
          revision: post.revision,
        },
        "PUT",
      );
      setPost(data);
      setSaved(JSON.stringify(data));
      setNotice("Blog SEO saved.");
      setRows((prev) => prev.map((row) => (row.id === data.id ? data : row)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="seo-blog-page">
      <div className="seo-page-toolbar">
        <div className="seo-heading">
          <div>
            <Heading as="h1" size="6">
              Blogs
            </Heading>
            <p className="seo-page-description">
              {post ? post.title : "Search settings for your articles."}
            </p>
          </div>
          {post && (
            <Flex gap="3">
              <Button
                variant="soft"
                color="gray"
                disabled={busy || uploading || dirty}
                onClick={() => {
                  setPost(null);
                  setNotice("");
                }}
              >
                <ArrowLeft size={16} />
                All blogs
              </Button>
              <Button onClick={save} disabled={busy || uploading || !dirty}>
                <Save size={16} />
                {busy ? "Saving…" : "Save SEO"}
              </Button>
            </Flex>
          )}
        </div>
      </div>
      {error && (
        <p className="seo-error" role="alert">
          {error}{" "}
          {post && (
            <Button variant="soft" color="gray" onClick={() => open(post.id)}>
              Reload saved SEO
            </Button>
          )}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {post ? (
        <section className="seo-panel seo-blog-editor">
          <div className="seo-field">
            <label htmlFor="blog-slug">URL slug</label>
            <TextField.Root
              id="blog-slug"
              value={post.slug}
              maxLength={180}
              onChange={(e) => change("slug", e.target.value)}
            />
            {post.published_at &&
              post.slug !== JSON.parse(saved || "{}").slug && (
                <small>Old links will redirect to the new URL.</small>
              )}
          </div>
          <div className="seo-field">
            <div className="seo-blog-label">
              <label htmlFor="blog-meta-title">Meta title</label>
              <span>{effectiveSeo!.title.length}/60</span>
            </div>
            <TextField.Root
              id="blog-meta-title"
              maxLength={120}
              value={post.meta_title}
              placeholder={post.title}
              onChange={(e) => change("meta_title", e.target.value)}
            />
          </div>
          <div className="seo-field">
            <div className="seo-blog-label">
              <label htmlFor="blog-meta-description">Meta description</label>
              <span>{effectiveSeo!.description.length}/160</span>
            </div>
            <TextArea
              id="blog-meta-description"
              rows={3}
              maxLength={320}
              value={post.meta_description}
              placeholder={effectiveSeo!.description}
              onChange={(e) => change("meta_description", e.target.value)}
            />
          </div>
          <div className="seo-field">
            <label htmlFor="blog-keywords">Keywords</label>
            <TextField.Root
              id="blog-keywords"
              value={post.meta_keywords || ""}
              maxLength={1000}
              placeholder="Property guides, Coimbatore real estate"
              onChange={(e) => change("meta_keywords", e.target.value)}
            />
            <small>Separate keywords with commas.</small>
          </div>
          <Flex gap="3" align="center" className="seo-blog-indexing">
            <Switch
              id="blog-noindex"
              checked={post.noindex}
              onCheckedChange={(value) => change("noindex", value)}
            />
            <label htmlFor="blog-noindex">Hide from search engines</label>
          </Flex>
          <details className="seo-blog-optional">
            <summary>
              Social image{" "}
              <span>
                {post.social_image ? "Custom image" : "Uses cover image"}
              </span>
            </summary>
            <div className="seo-field">
              <label htmlFor="blog-social-image">Image URL</label>
              <TextField.Root
                id="blog-social-image"
                type="url"
                value={post.social_image}
                onChange={(e) => change("social_image", e.target.value)}
              />
            </div>
            <OgImageUpload
              compact
              value={post.social_image}
              onChange={(url) => change("social_image", url)}
              disabled={busy}
              onUploadingChange={setUploading}
            />
          </details>
          <details className="seo-blog-optional">
            <summary>Search preview</summary>
            <div className="seo-blog-preview">
              <Text as="p" size="1" color="gray">
                majestanrealty.com › blogs › {post.slug}
              </Text>
              <Heading as="h3" size="4" color="blue" mt="2">
                {effectiveSeo!.title}
              </Heading>
              <Text as="p" size="2" mt="2">
                {effectiveSeo!.description}
              </Text>
            </div>
          </details>
          <Flex
            gap="3"
            justify="between"
            wrap="wrap"
            className="seo-blog-footer"
          >
            {dirty ? (
              <Button
                variant="soft"
                color="gray"
                disabled={busy || uploading}
                onClick={() => {
                  setPost(JSON.parse(saved));
                  setError("");
                }}
              >
                Discard changes
              </Button>
            ) : (
              <span />
            )}
            <Button asChild variant="ghost">
              <a
                href={`/blogs/${JSON.parse(saved || "{}").slug || post.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={16} />
                View article
              </a>
            </Button>
          </Flex>
        </section>
      ) : loading ? (
        <Skeleton height="240px" />
      ) : (
        <>
          <div className="seo-table-wrap">
            <Table.Root variant="surface" className="seo-table">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Article</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    Search visibility
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>SEO</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell>{row.title}</Table.Cell>
                    <Table.Cell>
                      <Badge color="gray">{row.status}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {row.noindex ? "Noindex" : "Indexable"}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="soft"
                        size="1"
                        disabled={busy}
                        onClick={() => open(row.id)}
                      >
                        Edit SEO
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {!rows.length && (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      No blogs yet. Create an article in the CRM to manage its
                      SEO here.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </div>
          <Flex justify="between" align="center" mt="4">
            <Button
              variant="soft"
              color="gray"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Text size="2">
              Page {page} of {Math.max(1, Math.ceil(total / 30))}
            </Text>
            <Button
              variant="soft"
              color="gray"
              disabled={page * 30 >= total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </div>
  );
}
