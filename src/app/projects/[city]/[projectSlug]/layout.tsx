import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { ProjectNavigation } from "@/components/site/project/project-navigation";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen! bg-gray-50!">
      <SiteHeader />
      <div className="pt-24! md:pt-28!">
        <ProjectNavigation />
      </div>
      <main className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8! py-8! scroll-smooth!">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
