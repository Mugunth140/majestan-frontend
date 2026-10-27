import { getSeo,seoMetadata } from '@/lib/seo-engine';
import { CoreSeoBoundary } from '@/components/seo/core-seo';
import { Metadata } from "next";
import { AboutHero } from "@/components/site/about/AboutHero";
import { AboutMission } from "@/components/site/about/AboutMission";
import { AboutValues } from "@/components/site/about/AboutValues";
import { AboutServices } from "@/components/site/about/AboutServices";
import { AboutClosing } from "@/components/site/about/AboutClosing";
import styles from "@/components/site/about/about.module.css";

const defaultMetadata: Metadata = {
  title: "About Us | Majestan Realty",
  description: "Learn more about Majestan Realty, our mission, values, and our commitment to helping you find the perfect property.",
};

export async function generateMetadata():Promise<Metadata>{return seoMetadata(await getSeo('/about-us'),defaultMetadata);}

export default function AboutPage() {
  return (<CoreSeoBoundary path="/about-us">
    <main className={`font-manrope-page ${styles.page}`}>
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutServices />
      <AboutClosing />
    </main>
  </CoreSeoBoundary>);
}
