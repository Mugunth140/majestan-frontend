import Link from "next/link";
import { getLocalityDescription } from "@/lib/api/localities";
import { CARD, HEADING, TEXT_LINK } from "@/components/site/project/project-ui";

export async function LocalityTeaserServer({ locality, city, localityHref }: { locality: string; city?: string; localityHref?: string }) {
  const about = await getLocalityDescription(locality, city);
  if (!about) return null;
  return <section className={CARD}>
    <h2 className={HEADING}>About {about.name}</h2>
    <p className="mt-4! text-gray-500! font-normal! leading-relaxed! line-clamp-3!">{about.description}</p>
    {localityHref && <Link href={localityHref} className={`${TEXT_LINK} mt-4! inline-flex! items-center! gap-2! text-sm! font-semibold!`}>View locality guide</Link>}
  </section>;
}
