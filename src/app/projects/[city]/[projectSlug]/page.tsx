import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/layout/breadcrumbs";
import { MapPlaceholder } from "@/components/search/MapPlaceholder";
import {
  getAllProjectSlugs,
  getProjectBySlugUrl,
  formatINR,
  toSlug,
  type ProjectDetail,
} from "@/lib/api/projects";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs
    .map((canonical) => canonical.replace(/^\/+/, "").split("/"))
    .filter((parts) => parts.length === 3 && parts[0] === "projects")
    .map(([, city, projectSlug]) => ({ city, projectSlug }));
}

type PageProps = {
  params: Promise<{ city: string; projectSlug: string }>;
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").trim().slice(0, 160);

function parseRobots(robotsStr?: string): { index: boolean; follow: boolean } {
  if (!robotsStr) return { index: true, follow: true };
  const [indexPart, followPart] = robotsStr.split(",");
  return {
    index: indexPart?.trim() === "index",
    follow: followPart?.trim() === "follow",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) return { title: "Not Found | Majestan Realty", robots: { index: false, follow: false } };

  const canonicalPath = `/${project.canonicalSlug}`;
  const seo = project.seo?.seoData?.overview;
  const typeLabel = project.projectType === "villa" ? "Villa" : "Apartment";
  const bhkLabel = project.ranges.bhk.length ? `${project.ranges.bhk.join(", ")} BHK ` : "";
  const priceLabel =
    project.ranges.minPrice != null
      ? ` ${formatINR(project.ranges.minPrice)}${project.ranges.maxPrice && project.ranges.maxPrice !== project.ranges.minPrice ? ` - ${formatINR(project.ranges.maxPrice)}` : ""}`
      : "";

  const title = seo?.title || `${project.name} - ${bhkLabel}${typeLabel} in ${project.city} | Majestan Realty`;
  const description =
    seo?.description ||
    (project.description
      ? stripHtml(project.description)
      : `${project.name}, ${bhkLabel}${typeLabel.toLowerCase()} project in ${project.city}.${priceLabel ? ` Price${priceLabel}.` : ""} View configurations, floor plans, photos and locality details.`);
  const robots = parseRobots(seo?.robots);
  const ogImage = seo?.og_image || project.coverImageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: canonicalPath,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: project.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      ...robots,
      googleBot: { index: robots.index ?? true, follow: robots.follow ?? true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

function buildJsonLd(project: ProjectDetail) {
  const url = `https://www.majestanrealty.com/${project.canonicalSlug}`;
  const units = project.units.filter((u) => u.status === "available");
  const prices = units.map((u) => Number(u.price)).filter((n) => Number.isFinite(n) && n > 0);
  const graph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "ApartmentComplex",
      name: project.name,
      url,
      address: {
        "@type": "PostalAddress",
        addressLocality: project.sublocation || project.city,
        addressRegion: project.city,
      },
      ...(prices.length
        ? {
            offers: {
              "@type": "AggregateOffer",
              lowPrice: Math.min(...prices),
              highPrice: Math.max(...prices),
              priceCurrency: "INR",
              offerCount: units.length,
            },
          }
        : {}),
    },
  ];
  const faqs = project.seo?.seoData?.faqs?.filter((f) => f.question && f.answer);
  if (faqs?.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  return graph;
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-6! md:p-8! scroll-mt-40!">
      <h2 className="text-xl! md:text-2xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-5!">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProjectOverviewPage({ params }: PageProps) {
  const { city, projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) notFound();

  if (toSlug(project.city) !== city.toLowerCase()) {
    permanentRedirect(`/${project.canonicalSlug}`);
  }

  const typeLabel = project.projectType === "villa" ? "Villa" : "Apartment";
  const breadcrumbItems = [
    { label: `${typeLabel} Projects`, href: "/projects" },
    { label: project.city, href: `/projects?city=${encodeURIComponent(project.city)}` },
    { label: project.name },
  ];
  const gallery = project.galleryImageUrls ?? [];
  const faqs = project.seo?.seoData?.faqs?.filter((f) => f.question && f.answer) ?? [];

  return (
    <div className="flex! flex-col! gap-6!">
      <Breadcrumbs items={breadcrumbItems} jsonLd />
      {buildJsonLd(project).map((node, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />
      ))}

      <Section id="overview" title={`About ${project.name}`}>
        {project.coverImageUrl && (
          <img src={project.coverImageUrl} alt={project.name} className="w-full! max-h-[420px]! object-cover! rounded-xl! mb-6!" />
        )}
        {project.description ? (
          <div className="prose! max-w-none! text-gray-600! whitespace-pre-line!">{project.description}</div>
        ) : (
          <p className="text-gray-500!">
            {project.name} is a {typeLabel.toLowerCase()} project in {[project.sublocation, project.city].filter(Boolean).join(", ")}
            {project.builderName ? ` by ${project.builderName}` : ""}.
            {project.ranges.bhk.length ? ` Configurations: ${project.ranges.bhk.map((b) => `${b} BHK`).join(", ")}.` : ""}
          </p>
        )}
        <div className="grid! grid-cols-2! md:grid-cols-4! gap-5! mt-6! pt-6! border-t! border-gray-100!">
          {[
            { label: "Possession", value: project.possessionStatus.replace(/_/g, " ") },
            ...(project.possessionDate ? [{ label: "Possession By", value: project.possessionDate }] : []),
            ...(project.towers ? [{ label: "Towers", value: String(project.towers) }] : []),
            ...(project.totalUnits ? [{ label: "Total Units", value: String(project.totalUnits) }] : []),
          ].map((fact) => (
            <div key={fact.label}>
              <p className="text-xs! font-bold! uppercase! tracking-wider! text-gray-400!">{fact.label}</p>
              <p className="font-bold! text-gray-900! capitalize! mt-1!">{fact.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {project.units.length > 0 && (
        <Section id="configurations" title="Configurations & Pricing">
          <div className="overflow-x-auto!">
            <table className="w-full! text-sm! text-left!">
              <thead>
                <tr className="text-xs! uppercase! tracking-wider! text-gray-400! border-b! border-gray-100!">
                  <th className="py-3! pr-4! font-bold!">Unit</th>
                  <th className="py-3! pr-4! font-bold!">Type</th>
                  <th className="py-3! pr-4! font-bold!">Area (sq.ft)</th>
                  <th className="py-3! pr-4! font-bold!">Price</th>
                  <th className="py-3! font-bold!">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y! divide-gray-50!">
                {project.units.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3.5! pr-4! font-bold! text-gray-900!">
                      {u.bedrooms != null ? `${u.bedrooms} BHK` : u.title || u.unitCode}
                      <span className="block! text-xs! font-medium! text-gray-400!">{u.unitCode}</span>
                    </td>
                    <td className="py-3.5! pr-4! text-gray-600! capitalize!">{u.unitType?.replace(/_/g, " ")}</td>
                    <td className="py-3.5! pr-4! text-gray-600!">
                      {(u.builtupAreaSqft || u.carpetAreaSqft || u.superBuiltupAreaSqft)
                        ? Number(u.builtupAreaSqft || u.carpetAreaSqft || u.superBuiltupAreaSqft).toLocaleString("en-IN")
                        : "-"}
                    </td>
                    <td className="py-3.5! pr-4! font-extrabold! text-[#27427f]! whitespace-nowrap!">{formatINR(u.price)}</td>
                    <td className="py-3.5! capitalize! text-gray-600!">{u.status?.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {project.units.some((u) => u.floorPlanImageUrl) && (
        <Section id="floor-plans" title="Floor Plans">
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-5!">
            {project.units
              .filter((u) => u.floorPlanImageUrl)
              .map((u) => (
                <figure key={u.id} className="border! border-gray-100! rounded-xl! overflow-hidden!">
                  <img src={u.floorPlanImageUrl!} alt={`${u.bedrooms != null ? `${u.bedrooms} BHK` : u.unitCode} floor plan`} className="w-full! object-contain! bg-gray-50!" loading="lazy" />
                  <figcaption className="px-4! py-3! text-sm! font-bold! text-gray-700! border-t! border-gray-100!">
                    {u.bedrooms != null ? `${u.bedrooms} BHK` : u.unitCode}
                    {u.builtupAreaSqft ? ` · ${Number(u.builtupAreaSqft).toLocaleString("en-IN")} sq.ft` : ""}
                  </figcaption>
                </figure>
              ))}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section id="photos" title="Photos">
          <div className="grid! grid-cols-2! md:grid-cols-3! gap-4!">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-[4/3]! bg-gray-100! rounded-xl! overflow-hidden!">
                <img src={src} alt={`${project.name} photo ${i + 1}`} className="w-full! h-full! object-cover!" loading="lazy" />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section id="amenities" title="Amenities">
        <p className="text-gray-500!">Amenity details for {project.name} are being updated. Contact us for the full amenities list.</p>
      </Section>

      <Section id="locality" title={`Locality — ${project.sublocation || project.city}`}>
        {project.address && <p className="text-gray-600! mb-5!">{project.address}</p>}
        <div className="h-[320px]! rounded-xl! overflow-hidden! border! border-gray-100!">
          <MapPlaceholder city={project.city} locality={project.sublocation || undefined} />
        </div>
      </Section>

      {project.builderName && (
        <Section id="builder" title={`About ${project.builderName}`}>
          <p className="text-gray-600!">
            {project.builderName} is the developer of {project.name} in {project.city}.
            {project.reraNumber ? ` This project is RERA registered (${project.reraNumber}).` : ""}
          </p>
        </Section>
      )}

      {faqs.length > 0 && (
        <Section id="faqs" title="Frequently Asked Questions">
          <div className="flex! flex-col! gap-4!">
            {faqs.map((f, i) => (
              <div key={i} className="border! border-gray-100! rounded-xl! p-5!">
                <h3 className="font-bold! text-gray-900! mb-2!">{f.question}</h3>
                <p className="text-gray-600! text-sm!">{f.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
