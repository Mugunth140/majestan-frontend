import { connection } from "next/server";
import SlugPage, { generateMetadata as slugMetadata } from "../../[slug]/page";
import { getSeoForDetail } from "@/lib/seo-engine";

// Public inventory has no query-dependent content. Listings keep their dynamic
// route, while these pages can reuse rendered HTML until CRM invalidation.
export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }

type Props = { params: Promise<{ segments: string[] }>; searchParams?: Promise<Record<string, string | string[] | undefined>> };
async function publicParams(params: Props["params"]) {
  return { slug: (await params).segments.join("/") };
}
export async function generateMetadata({ params }: Props) {
  const resolved = await publicParams(params);
  await getSeoForDetail(`/${resolved.slug}`);
  return slugMetadata({ params: Promise.resolve(resolved) });
}
export default async function DetailPage({ params, searchParams }: Props) {
  const resolved = await publicParams(params);
  const seo = await getSeoForDetail(`/${resolved.slug}`);
  // A custom listing rule can resemble a code-suffixed inventory URL. Keep
  // that rule working with live query filters rather than caching it or 404ing.
  if (seo?.scope === "listing") {
    await connection();
    return SlugPage({ params: Promise.resolve(resolved), searchParams });
  }
  return SlugPage({ params: Promise.resolve(resolved), searchParams: Promise.resolve({}) });
}
