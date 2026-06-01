import Link from "next/link";
import { FeatureCarousel } from "./property-carousel";
import { HeroSection } from "./hero-section";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { HomePageData } from "@/lib/api";

const city = "coimbatore";



const saleCards = [
  ["Apartment", `/buy-apartments-${city}`, "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", "for sale"],
  ["Villa", `/buy-villas-${city}`, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "for sale"],
  ["Independent Houses", `/buy-independent-houses-${city}`, "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "for sale"],
  ["Plot", `/buy-plots-${city}`, "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "for sale"],
  ["Commercial Space", `/buy-commercial-${city}`, "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", "for sale"],
] as const;

const rentCards = [
  ["Office Space", `/rent-commercial-space-${city}`, "/assets/images/home/office-space.png", "for Rent in Coimbatore"],
  ["Ware House", `/rent-industrials-${city}`, "/assets/images/home/industrial-warehouse.png", "for Rent in Coimbatore"],
  ["Showroom", `/rent-commercial-space-${city}`, "/assets/images/home/showrooms.png", "for Rent in Coimbatore"],
  ["Apartment", `/rent-apartments-${city}`, "/assets/images/home/apartment.png", "for Rent in Coimbatore"],
  ["Villa", `/rent-villas-${city}`, "/assets/images/home/villa.png", "for Rent in Coimbatore"],
  ["Independent Houses", `/rent-independent-houses-${city}`, "/assets/images/home/independent-house.png", "for Rent in Coimbatore"],
] as const;

const helpItems = [
  ["Find Your Ideal Property", "Browse verified listings for plots, apartments, villas, and commercial spaces with detailed descriptions and images.", "/assets/images/icons/ideal-property.png"],
  ["Seamless Buying & Leasing", "Get expert assistance in property transactions, from site visits to finalizing deals.", "/assets/images/icons/seamless-buying-and-leasing.png"],
  ["Investor & Seller Support", "Connect with potential buyers, tenants, and investors to maximize your property's value.", "/assets/images/icons/support.png"],
  ["Market Insights & Updates", "Stay informed with the latest real estate trends, investment tips, and new project launches.", "/assets/images/icons/ideal-property.png"],
] as const;

const projectCards = [
  ["Ready to Move", "/assets/images/home/ready_to_move.webp", "1545+ Projects"],
  ["Under Construction", "/assets/images/home/under_construction.webp", "148+ Projects"],
  ["New Launch", "/assets/images/home/new_launch.webp", "77+ Projects"],
  ["Resale", "/assets/images/home/resale.png", "77+ Projects"],
] as const;

const serviceCards = [
  ["Property Management", "/services/property-management", "Residential and commercial leasing support from tenant search to ongoing care."],
  ["Rent a Property", "/rent-or-sell-your-property", "Guided leasing support for homes, offices, warehouses, and commercial spaces."],
  ["Sell a Property", "/rent-or-sell-your-property", "Market pricing, qualified leads, and hands-on support through closure."],
] as const;

export function HomePage({ data }: { data: HomePageData }) {
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
              title="Properties for Sale in Coimbatore"
              text="Explore our exclusive collection of premium residential and commercial spaces tailored to your lifestyle."
            />
            
            {/* <h3 className="mb-8 mt-12 text-xs md:text-sm font-semibold tracking-[0.15em] text-gray-400 uppercase">Explore by Category</h3> */}
            <CardRail cards={saleCards} />

            <h3 className="mb-8! mt-24! text-xs! md:text-sm! font-semibold! tracking-[0.15em]! text-gray-400! uppercase!">Featured Projects</h3>
            <FeatureCarousel properties={data.featuredApartments} emptyMessage="Featured apartments will appear here soon." />
          </div>
        </section>

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

        <section className="hwch-section section-help tf-spacing-1 pb-0">
          <div className="tf-container">
            <SectionHeading
              title="How can we help you?"
              text="Supporting you at every stage of your real estate journey."
            />
            <div className="tf-grid-layout md-col-2 mb-6">
              {helpItems.map(([title, text, icon]) => (
                <article className="icons-box style-3 migrated-help-card" key={title}>
                  <div className="tf-icon">
                    <img src={icon} width="40" alt={title} />
                  </div>
                  <div className="content">
                    <h5 className="title">{title}</h5>
                    <p className="text-1">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="item text-center">
            <img src="/assets/images/section/section-help.png" alt="section-help" />
          </div>
        </section>

        <section className="rent-in-cbe section-best-sale tf-spacing-7">
          <div className="tf-container">
            <SectionHeading
              title="Properties for Rent in Coimbatore"
              text="Find the best rental properties in Coimbatore, from homes to commercial spaces."
            />
            <h2 className="section-subtitle">By Property</h2>
            <CardRail cards={rentCards} />

            <h2 className="section-subtitle">Featured Villa Projects in Coimbatore</h2>
            <FeatureCarousel properties={data.featuredVillas} emptyMessage="Featured villas will appear here soon." />
          </div>
        </section>

        <section className="pt-0 section-categories-neighborhoods tf-spacing-7">
          <div className="tf-container">
            <SectionHeading title="Projects in Coimbatore" />
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
        </section>

        <section className="section-sale">
          <div className="box-sale">
            <div className="tf-container">
              <div className="heading-section text-center mb-48">
                <h2 className="title text-white">Sell Your Property Fast with Majestan Realty</h2>
                <p className="text-1 text-white">Expert guidance, quick closures and maximum value for your home.</p>
              </div>
              <Link href="/rent-or-sell-your-property" className="tf-btn bg-color-primary pd-12 mx-auto fw-7">
                Meet The Team
              </Link>
            </div>
          </div>
          <div className="tf-container">
            <div className="tf-grid-layout md-col-3 migrated-services">
              {serviceCards.map(([title, href, text]) => (
                <article className="icons-box style-7 effec-icon" key={title}>
                  <div className="tf-icon text-center">
                    <i className="icon-house-1" />
                  </div>
                  <h4 className="title text-center">
                    <Link href={href}>{title}</Link>
                  </h4>
                  <p className="text-center text-1">{text}</p>
                  <Link href={href} className="tf-btn style-border pd-6 fw-7 mx-auto">
                    Find out more
                  </Link>
                </article>
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
  return (
    <div className="flex! flex-col! md:flex-row! md:items-end! justify-between! gap-6! mb-4!">
      <div className="flex flex-col! md:flex-row! justify-between! items-center! gap-4! p-2! md:py-8! md:px-6!">
        <h2 className="font-['Lexend',sans-serif]! text-[#0a0a0a]! leading-[1.1]! tracking-[-0.02em]! drop-shadow-sm! font-light! text-[clamp(30px,4vw,50px)]!">
          {title}
        </h2>
        {text ? <p className="mt-5! text-lg! font-light! text-gray-500! leading-relaxed! max-w-[65ch]!">{text}</p> : null}
      </div>
    </div>
  );
}

function CardRail({
  cards,
}: {
  cards: readonly (readonly [string, string, string, string])[];
}) {
  return (
    <div className="grid! grid-cols-1! md:grid-cols-10! gap-5! md:gap-6!">
      {cards.map(([title, href, image, text], i) => {
        const isMain = i === 0;
        const colSpan = isMain ? "md:col-span-6!" : "md:col-span-4!";
        const rowSpan = isMain ? "md:row-span-2!" : "md:row-span-1!";
        const height = isMain ? "min-h-[250px]! md:min-h-[400px]!" : "min-h-[250px]! md:min-h-[320px]!";

        return (
          <Link
            key={title}
            href={href}
            className={`group! relative! overflow-hidden! rounded-3xl! bg-[#f9fafb]! flex! flex-col! justify-end! p-6! md:p-8! transition-all! duration-400! hover:shadow-[0_20px_40px_-15px_rgba(39,66,127,0.15)]! hover:-translate-y-1! ${colSpan} ${rowSpan} ${height}`}
          >
            <div className="absolute! inset-0! z-0! bg-[#eef2f6]!">
              <img
                src={image}
                alt={title}
                className="w-full! h-full! object-cover! transition-transform! duration-1000! ease-[cubic-bezier(0.25,1,0.5,1)]! group-hover:scale-105!"
              />
              <div className="absolute! inset-0! bg-linear-to-t! from-[#0a0a0a]/90! via-[#0a0a0a]/20! to-transparent! opacity-80! transition-opacity! duration-700! group-hover:opacity-100!" />
            </div>
            
            <div className="relative! z-10! flex! flex-col! items-start! transform! transition-transform! duration-700! ease-[cubic-bezier(0.25,1,0.5,1)]! group-hover:-translate-y-2">
              <span className="mb-3! rounded-full! bg-white/20! backdrop-blur-md! border! border-white/20! px-3.5! py-1! text-[10px]! md:text-xs! font-semibold! uppercase! tracking-[0.1em]! text-white! shadow-sm!">
                {text}
              </span>
              <h5 className="text-2xl! md:text-[32px]! font-['Lexend',sans-serif]! font-light! text-white! tracking-tight! leading-none! drop-shadow-sm!">
                {title}
              </h5>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
