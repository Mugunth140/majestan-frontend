import { Metadata } from "next";
import { SiteHeader } from "@/components/site/layout/site-header";
import { SiteFooter } from "@/components/site/layout/site-footer";
import { AboutHero } from "@/components/site/about/AboutHero";
import { AboutMission } from "@/components/site/about/AboutMission";
import { AboutValues } from "@/components/site/about/AboutValues";
import { AboutStats } from "@/components/site/about/AboutStats";

export const metadata: Metadata = {
  title: "About Us | Majestan Realty",
  description: "Learn more about Majestan Realty, our mission, values, and our commitment to helping you find the perfect property.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[100px]! md:pt-[120px]! min-h-screen! bg-white!">
        <AboutHero />
        <AboutMission />
        <AboutValues />
        <AboutStats />
      </main>
      <SiteFooter />
    </>
  );
}
