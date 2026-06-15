"use client";

import Link from "next/link";
import { Search, Handshake, TrendingUp, BarChart3, Home, BadgePercent, Store, ArrowUpRight } from "lucide-react";
import { useLocationContext } from "@/contexts/LocationContext";
import { FeatureCarousel } from "./property-carousel";
import { LuxuryFeaturedSection } from "./luxury-featured-section";
import { HeroSection } from "./hero-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { HomePageData } from "@/lib/api";
import Image from "next/image";
import { toLocationSlug } from "@/lib/seo-urls";





export function HomePage({ data }: { data: HomePageData }) {
  const { location } = useLocationContext();
  const citySlug = toLocationSlug(location);
  
  // Always show featured properties since backend only returns top global 6 
  // and filtering them strictly by sublocation breaks the UI for other cities.
  const filteredApartments = data.featuredApartments;
  const filteredVillas = data.featuredVillas;

  const saleCards = [
    ["Apartment", `/for-sale/apartments/${citySlug}`, "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", "for sale"],
    ["Villa", `/for-sale/villas/${citySlug}`, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "for sale"],
    ["Individual Houses", `/for-sale/independent-houses/${citySlug}`, "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "for sale"],
    ["Plot", `/for-sale/plots/${citySlug}`, "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "for sale"],
    ["Commercial Space", `/for-sale/commercial-spaces/${citySlug}`, "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", "for sale"],
  ] as const;

  const rentCards = [
    ["Office Space", `/for-rent/commercial-spaces/${citySlug}`, "https://images.unsplash.com/photo-1631193816258-28b44b21e78b?auto=format&fit=crop&w=800&q=80", "for rent"],
    ["Warehouse", `/for-rent/industrial-spaces/${citySlug}`, "https://images.unsplash.com/photo-1689942010216-dc412bb1e7a9?auto=format&fit=crop&w=800&q=80", "for rent"],
    ["Showroom", `/for-rent/commercial-spaces/${citySlug}`, "https://images.unsplash.com/photo-1555529902-5261145633bf?auto=format&fit=crop&w=800&q=80", "for rent"],
    ["Apartment", `/for-rent/apartments/${citySlug}`, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", "for rent"],
    ["Villa", `/for-rent/villas/${citySlug}`, "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", "for rent"],
    ["Individual Houses", `/for-rent/independent-houses/${citySlug}`, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "for rent"],
  ] as const;

  const helpItems = [
    ["Find Your Ideal Property", "Browse verified premium listings for plots, apartments, villas, and commercial spaces.", Search],
    ["Seamless Buying & Leasing", "Get expert, white glove assistance in property transactions, from site visits to finalizing deals.", Handshake],
    ["Investor & Seller Support", "Connect with potential buyers, tenants, and investors to maximize your property's true value.", TrendingUp],
    ["Market Insights & Updates", "Stay informed with the latest real estate trends, investment tips, and new luxury project launches.", BarChart3],
  ] as const;

  const projectCards = [
    ["Ready to Move", "/assets/images/home/ready_to_move.webp", "1545+ Projects"],
    ["Under Construction", "/assets/images/home/under_construction.webp", "148+ Projects"],
    ["New Launch", "/assets/images/home/new_launch.webp", "77+ Projects"],
    ["Resale", "/assets/images/home/resale.png", "77+ Projects"],
  ] as const;

  const serviceCards = [
    ["Property Management", "/services/property-management", "Residential and commercial leasing support from tenant search to ongoing care.", Home],
    ["Rent a Property", "/rent-or-sell-your-property", "Guided leasing support for homes, offices, warehouses, and commercial spaces.", BadgePercent],
    ["Sell a Property", "/rent-or-sell-your-property", "Market pricing, qualified leads, and hands-on support through closure.", Store],
  ] as const;

  return (
    <div id="wrapper" className="counter-scroll migrated-home">
      <SiteHeader />

      <main>
        <HeroSection
          sublocations={data.filters.sublocations}
          unitTypes={data.filters.unitTypes}
        />

        <section className="sale-in-cbe py-24 bg-white relative overflow-hidden">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
            <SectionHeading
              title={`Properties for Sale in ${location}`}
              text="Explore our exclusive collection of premium residential and commercial spaces tailored to your lifestyle."
            />
            
            {/* <h3 className="mb-8 mt-12 text-xs md:text-sm font-semibold tracking-[0.15em] text-gray-400 uppercase">Explore by Category</h3> */}
            <CardRail cards={saleCards} />
          </div>
        </section>

        <LuxuryFeaturedSection 
          properties={filteredApartments} 
          title="Handpicked Properties" 
          subtitle={`Curated listings across ${location}'s most sought-after localities`} 
        />

        <section className="py-24! bg-white!">
          <div className="w-full! max-w-400! mx-auto! px-4! sm:px-6! md:px-8!">
            <SectionHeading
                title={`Exclusive Offers and Highlights`}
                text="Discover the latest premium updates, exclusive deals, and featured communities."
            />
            <div className="mt-12! rounded-2xl! overflow-hidden! shadow-md! group!">
              <FeatureCarousel
                banners={[
                  { id: 1, image: "/assets/images/banners/banner_1.jpeg", href: "" },
                  { id: 2, image: "/assets/images/banners/banner_2.jpeg", href: "" },
                  { id: 3, image: "/assets/images/banners/banner_3.jpeg", href: "" },
                ]}
                emptyMessage="Banner images will appear here soon."
                variant="banner"
              />
            </div>
          </div>
        </section>

        <section className="py-24! pb-64! md:pb-80! lg:pb-40! bg-linear-to-b! from-[#f0f4f8]! via-[#f9fafb]! to-white! relative! overflow-hidden!">
          {/* Background Image positioned at the bottom */}
          <div className="absolute! bottom-0! left-0! w-full! z-0!">
            <img 
              src="/assets/images/section/section-help.png" 
              alt="Majestan Support" 
              className="w-full! h-auto! min-h-[300px]! object-cover! object-top! md:object-contain! md:object-bottom! scale-125! md:scale-100! origin-bottom!"
            />
          </div>

          <div className="w-full! max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8! relative! z-10!">
            <div className="text-center! mb-16!">
              <h2 className="font-['Lexend',sans-serif]! text-[#0a0a0a]! leading-[1.1]! tracking-[-0.02em]! drop-shadow-sm! font-light! text-[clamp(30px,4vw,50px)]! mb-4!">
                How can we help you?
              </h2>
              <p className="text-lg! font-light! text-gray-500! max-w-2xl! mx-auto!">
                Supporting you at every stage of your real estate journey. From finding the perfect property to seamless transactions and market insights.
              </p>
            </div>
            
            <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-4! gap-6! md:gap-8!">
              {helpItems.map(([title, text, Icon]) => (
                <article className="group! bg-white! rounded-[2rem]! p-8! shadow-[0_10px_30px_-15px_rgba(39,66,127,0.12)]! transition-all! duration-500! hover:shadow-[0_20px_40px_-15px_rgba(39,66,127,0.2)]! hover:-translate-y-2! border! border-[#27427f]/10!" key={title as string}>
                  <div className="w-14! h-14! rounded-2xl! bg-[#f9fafb]! border! border-[#27427f]/5! flex! items-center! justify-center! mb-6! transition-transform! duration-500! group-hover:scale-110! group-hover:bg-[#27427f]/5!">
                    <Icon className="w-7! h-7! text-amber-500! opacity-80!" strokeWidth={1.5} />
                  </div>
                  <h5 className="text-xl! font-['Lexend',sans-serif]! font-medium! text-[#27427f]! tracking-tight! mb-3!">
                    {title as string}
                  </h5>
                  <p className="text-sm! font-normal! text-[#27427f]/60! leading-relaxed!">
                    {text as string}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24! bg-white! relative! overflow-hidden!">
          <div className="w-full! max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8!">
            <SectionHeading
              title={`Properties for Rent in ${location}`}
              text="Find the perfect rental property to match your lifestyle and business needs."
            />
            
            <CardRail cards={rentCards} gridClass="lg:grid-cols-3!" />
          </div>
        </section>

        <LuxuryFeaturedSection 
          properties={filteredVillas} 
          title="Featured Villa Projects" 
          subtitle={`Explore premium villas for sale in ${location}`} 
        />
{/* 
        <section className="pt-0 section-categories-neighborhoods tf-spacing-7">
          <div className="tf-container">
            <SectionHeading title={`Projects in ${location}`} />
            <div className="migrated-project-grid">
              {projectCards.map(([title, image, count]) => (
                <article className="box-location h-450 hover-img" key={title}>
                  <div className="image-wrap">
                    <img src={image} alt={title} />
                  </div>
                  <div className="content">
                    <h6 className="text-white">{title}</h6>
                    <span className="text-1 tf-btn style-border pd-23 text-white">
                      {count} <i className="icon-arrow-right" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section> */}

        <section className="relative! w-full! py-14! md:py-20! bg-white! overflow-hidden!">
          <div className="relative! z-10! w-full! max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8!">
            
            {/* Header Content - Centered */}
            <div className="flex! flex-col! items-center! text-center! max-w-4xl! mx-auto! mb-20!">
              <h2 className="text-4xl! md:text-5xl! lg:text-[56px]! font-light! text-slate-900! leading-tight! font-['Lexend',sans-serif]! tracking-tight! mb-6!">
                Sell Your Property Fast with Majestan Realty
              </h2>
              <p className="text-slate-500! text-lg! md:text-xl! leading-relaxed! max-w-2xl! font-light! mb-10!">
                Coimbatore's trusted real estate partner. Get expert guidance, quick closures, and maximum value for your home.
              </p>
              
              <Link 
                href="/rent-or-sell-your-property" 
                className="inline-flex! items-center! justify-center! bg-[#ffc900]! text-slate-900! font-semibold! px-10! py-4! rounded-full! transition-all! duration-300! hover:bg-[#1e3465]! hover:text-white! hover:shadow-[0_10px_20px_-10px_rgba(39,66,127,0.4)]!"
              >
                <span className="text-md! font-normal! tracking-relaxed!">Meet Our Team</span>
              </Link>
            </div>

            {/* Cards Grid */}
            <div className="grid! grid-cols-1! md:grid-cols-3! gap-8! lg:gap-12!">
              {serviceCards.map(([title, href, text, Icon], idx) => (
                <div key={title as string} className="group/card! relative! flex! flex-col! p-8! md:p-10! rounded-4xl! bg-[#f8fafc]! border! border-slate-200/60! transition-all! duration-500! hover:bg-white! hover:shadow-[0_20px_40px_-15px_rgba(39,66,127,0.1)]! hover:-translate-y-2! hover:border-[#27427f]/20!">
                  
                  <div className="flex! items-center! gap-5! mb-8!">
                    <div className="w-14! h-14! rounded-2xl! bg-white! border! border-slate-200! flex! items-center! justify-center! transition-colors! duration-500! group-hover/card:bg-[#27427f]! group-hover/card:border-[#27427f]! shrink-0!">
                      <Icon className="w-6! h-6! text-[#27427f]! transition-colors! duration-500! group-hover/card:text-white!" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl! font-semibold! text-slate-900! font-['Lexend',sans-serif]! tracking-tight! leading-tight!">
                      {title as string}
                    </h3>
                  </div>
                  
                  <p className="text-slate-500! text-base! leading-relaxed! mb-10! font-light! grow!">
                    {text as string}
                  </p>
                  
                  <div className="w-full! h-px! bg-slate-200! mb-6! transition-colors! duration-500! group-hover/card:bg-slate-100!"></div>
                  
                  <Link 
                    href={href as string} 
                    className="flex! items-center! text-sm! font-normal! text-slate-900! hover:text-[#27427f]! transition-colors! duration-300! uppercase! tracking-wide!"
                  >
                    <span>Find out more</span>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ title, text }: { title: string; text?: string }) {
  const noSubText = !text || text.trim() === "";
  
  // Split at " in " if it exists to force the city onto a new line
  const parts = title.split(" in ");
  const displayTitle = parts.length > 1 ? (
    <>
      {parts[0]} in
      <span className="!block">{parts[1]}</span>
    </>
  ) : title;

  return (
    <div className={`flex! flex-col! md:flex-row! md:items-end! md:justify-between! gap-6! mb-8! pb-4!  w-full!`}>
      <h2 className="font-['Lexend',sans-serif]! text-[#0a0a0a]! leading-[1.1]! tracking-[-0.02em]! drop-shadow-sm! font-light! text-[clamp(30px,4vw,50px)]! !text-left!">
        {displayTitle}
      </h2>
      {text ? (
        <p className="text-sm! md:text-lg! font-light! text-gray-400! leading-relaxed! max-w-[45ch]! md:text-right! md:self-end! mb-1!">
          {text}
        </p>
      ) : null}
    </div>
  );
}

function CardRail({
  cards,
  gridClass = "lg:grid-cols-5!"
}: {
  cards: readonly (readonly [string, string, string, string])[];
  gridClass?: string;
}) {
  return (
    <div className={`grid! grid-cols-2! md:grid-cols-3! ${gridClass} gap-4! md:gap-5!`}>
      {cards.map(([title, href, image, text], i) => (
        <Link
          key={title}
          href={href}
          className="group! relative! overflow-hidden! rounded-2xl! bg-[#f9fafb]! flex! flex-col! justify-end! p-5! md:p-6! h-[250px]! md:h-[320px]! transition-all! duration-500! hover:shadow-[0_20px_40px_-15px_rgba(39,66,127,0.2)]! hover:-translate-y-1.5!"
        >
          <div className="absolute! inset-0! z-0! bg-[#eef2f6]!">
            <img
              src={image}
              alt={title}
              className="w-full! h-full! object-cover! transition-transform! duration-1000! ease-[cubic-bezier(0.25,1,0.5,1)]! group-hover:scale-110!"
            />
            <div className="absolute! inset-0! bg-gradient-to-t! from-[#0a0a0a]/90! via-[#0a0a0a]/30! to-transparent! opacity-70! transition-opacity! duration-700! group-hover:opacity-95!" />
          </div>
          
          <div className="relative! z-10! flex! flex-col! items-start! transform! transition-transform! duration-700! ease-[cubic-bezier(0.25,1,0.5,1)]! group-hover:-translate-y-2">
            <span className="mb-3! rounded-full! bg-white/20! backdrop-blur-md! border! border-white/20! px-3! py-1! text-[9px]! md:text-[10px]! font-semibold! uppercase! tracking-[0.1em]! text-white! shadow-sm!">
              {text}
            </span>
            <h5 className="text-xl! md:text-2xl! font-['Lexend',sans-serif]! font-medium! text-white! tracking-tight! leading-tight! drop-shadow-sm!">
              {title}
            </h5>
            <div className="mt-4! h-[2px]! w-0! bg-white! transition-all! duration-700! ease-out! group-hover:w-12!"></div>
          </div>
        </Link>
      ))}
    </div>
  );
}
