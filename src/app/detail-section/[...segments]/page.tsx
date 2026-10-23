import { notFound, permanentRedirect } from "next/navigation";
import SectionPage, { generateMetadata as sectionMetadata } from "../../[slug]/[...section]/page";
import { getSeoForDetail } from "@/lib/seo-engine";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }

type Props = { params: Promise<{ segments: string[] }> };
async function source({ params }: Props) {
  const { segments } = await params;
  if (segments.length < 2) notFound();
  const section = segments.at(-1)!;
  const publicRoot = segments.slice(0, -1).join("/");
  const seo = await getSeoForDetail(`/${publicRoot}`);
  if (seo?.redirect) permanentRedirect(seo.redirect);
  if (seo?.gone || seo?.scope === "listing") notFound();
  return { slug: seo?.source_path?.replace(/^\//, "") || publicRoot, section: [section] };
}
export async function generateMetadata(props: Props) {
  return sectionMetadata({ params: Promise.resolve(await source(props)) });
}
export default async function CachedSectionPage(props: Props) {
  return SectionPage({ params: Promise.resolve(await source(props)) });
}
