import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { ProjectNavigation } from "@/components/site/project/project-navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ city: string; projectSlug: string }>;
}) {
  // Legacy /projects/city/slug route — pages here redirect to the canonical
  // /{slug} multi-page URLs, so the nav only needs a best-effort slug.
  const { city, projectSlug } = await params;
  return (
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      {/* Spacer matching fixed header height (64px constant across all breakpoints) */}
      <div className="h-[64px]!" aria-hidden="true" />
      <ProjectNavigation slug={`projects/${city}/${projectSlug}`} activeSection="" />
      <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! py-8! scroll-smooth!">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
