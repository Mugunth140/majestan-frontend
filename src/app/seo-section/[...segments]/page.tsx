import SectionPage, {
  generateMetadata as sectionMetadata,
} from "../../[slug]/[...section]/page";
import { getSeo } from "@/lib/seo-engine";
import { notFound, permanentRedirect } from "next/navigation";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ segments: string[] }> };
async function source({ params }: Props) {
  const { segments } = await params;
  const section = segments.at(-1)!;
  const path = "/" + segments.slice(0, -1).join("/");
  const seo = await getSeo(path);
  if (seo?.redirect) permanentRedirect(seo.redirect);
  if (!seo?.source_path || seo.gone) notFound();
  return { slug: seo.source_path.replace(/^\//, ""), section: [section] };
}
export async function generateMetadata(props: Props) {
  return sectionMetadata({ params: Promise.resolve(await source(props)) });
}
export default async function SeoSection(props: Props) {
  return <SectionPage params={Promise.resolve(await source(props))} />;
}
