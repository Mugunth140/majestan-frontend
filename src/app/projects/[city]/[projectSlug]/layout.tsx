import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { getProjectBySlugUrl, formatINR } from "@/lib/api/projects";

const TABS = [
  { label: "Overview", href: "#overview" },
  { label: "Configurations", href: "#configurations" },
  { label: "Floor Plans", href: "#floor-plans" },
  { label: "Photos", href: "#photos" },
  { label: "Amenities", href: "#amenities" },
  { label: "Locality", href: "#locality" },
];

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const project = await getProjectBySlugUrl(projectSlug).catch(() => null);
  if (!project) notFound();

  const bhkLabel = project.ranges.bhk.length
    ? project.ranges.bhk.map((b) => `${b} BHK`).join(" · ")
    : project.projectType === "villa" ? "Villa" : "Apartment";

  return (
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      <div className="bg-white! border-b! border-gray-200! pt-24! md:pt-28! pb-6!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
          <p className="text-xs! font-bold! uppercase! tracking-widest! text-gray-400! mb-2!">
            {project.projectType === "villa" ? "Villa Project" : "Apartment Project"} · {project.city}
          </p>
          <h1 className="text-3xl! md:text-4xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-2!">
            {project.name}
          </h1>
          <p className="text-gray-500! font-medium! mb-4!">
            {[project.sublocation, project.city].filter(Boolean).join(", ")}
            {project.builderName ? ` · by ${project.builderName}` : ""}
          </p>
          <div className="flex! flex-wrap! items-center! gap-x-6! gap-y-2!">
            <span className="text-2xl! font-extrabold! text-[#27427f]! font-['Lexend',sans-serif]!">
              {project.ranges.minPrice || project.ranges.maxPrice
                ? `${formatINR(project.ranges.minPrice)}${project.ranges.maxPrice && project.ranges.maxPrice !== project.ranges.minPrice ? ` - ${formatINR(project.ranges.maxPrice)}` : ""}`
                : "Price on Request"}
            </span>
            <span className="text-sm! font-semibold! text-gray-600!">{bhkLabel}</span>
            {project.ranges.minArea && (
              <span className="text-sm! font-semibold! text-gray-600!">
                {project.ranges.minArea.toLocaleString("en-IN")}
                {project.ranges.maxArea && project.ranges.maxArea !== project.ranges.minArea
                  ? ` - ${project.ranges.maxArea.toLocaleString("en-IN")}` : ""} sq.ft
              </span>
            )}
            {project.reraNumber && (
              <span className="text-xs! font-bold! text-emerald-700! bg-emerald-50! border! border-emerald-200! px-2.5! py-1! rounded-lg!">
                RERA: {project.reraNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white! sticky! top-[64px]! md:top-[68px]! z-40! border-b! border-gray-100! shadow-sm!">
        <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
          <nav className="flex! gap-1! overflow-x-auto!" aria-label="Project sections">
            {TABS.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="whitespace-nowrap! px-4! py-3.5! text-sm! font-bold! text-gray-500! hover:text-[#27427f]! border-b-2! border-transparent! hover:border-[#27427f]! transition-colors! no-underline!"
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! py-8! scroll-smooth!">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
