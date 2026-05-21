import Link from "next/link";
import { FeatureCarousel } from "./property-carousel";
import { HomeSearch } from "./home-search";
import { RotatingWords } from "./rotating-words";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { HomePageData } from "@/lib/api";

const city = "coimbatore";

const propertyCategories = [
  ["Apartment", "/property/apartment", "/assets/images/icons/apartment-home.png"],
  ["Villa", "/property/villa", "/assets/images/icons/villa.png"],
  ["Independent House", "/property/independent-house", "/assets/images/icons/independent.png"],
  ["Plots", "/property/plots", "/assets/images/icons/plot.png"],
  ["Commercial Space", "/property/commercial", "/assets/images/icons/commercial.png"],
  ["Industrial", "/property/industrial", "/assets/images/icons/industrial.png"],
  ["Farmland", "/property/farmland", "/assets/images/icons/farmland.png"],
  ["Co-Working", "/property/coworking", "/assets/images/icons/co-working.png"],
] as const;

const saleCards = [
  ["Apartment", `/buy-apartments-${city}`, "/assets/images/home/apartment-buy.png", "for sale"],
  ["Villa", `/buy-villas-${city}`, "/assets/images/home/villa-buy.png", "for sale"],
  ["Independent Houses", `/buy-independent-houses-${city}`, "/assets/images/home/independent-houses.png", "for sale"],
  ["Plot", `/buy-plots-${city}`, "/assets/images/home/plot-buy.png", "for sale"],
  ["Commercial Space", `/buy-commercial-${city}`, "/assets/images/home/commercial-buy.png", "for sale"],
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
        <section className="page-title home04 migrated-hero">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="content-inner">
                  <div className="heading-title flex! flex-col items-center text-center">

                    <h1 className="title home-title font-sans font-black tracking-tight text-[#27427f] leading-normal flex flex-wrap items-center justify-center gap-y-2 max-[720px]:text-[32px] max-[720px]:leading-[44px]">
                      <span>Your Trusted Partner to</span>
                      <RotatingWords words={["Buy", "Sell", "Rent"]} />
                      <span>Properties in <span className="relative inline-block text-[#ffc900] after:content-[''] after:absolute after:bottom-1.5 after:left-0 after:w-full after:h-[6px] after:bg-[#ffc900]/25 after:-z-10">Coimbatore</span></span>
                    </h1>
                  </div>

                  <ul className="widget-menu-tab migrated-category-tabs">
                    {propertyCategories.map(([label, href, icon]) => (
                      <li className="item-title" key={label}>
                        <Link href={href}>
                          <span className="d-grid migrated-category-link">
                            <img src={icon} width="60" alt="" />
                            {label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <HomeSearch
                    sublocations={data.filters.sublocations}
                    unitTypes={data.filters.unitTypes}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sale-in-cbe section-featured-properties tf-spacing-7">
          <div className="tf-container">
            <SectionHeading
              title="Properties for Sale in Coimbatore"
              text="Find the best properties for sale in Coimbatore, from residential homes to commercial spaces."
            />
            <h2 className="section-subtitle">By Property</h2>
            <CardRail cards={saleCards} />

            <h2 className="section-subtitle">Featured Apartment Projects in Coimbatore</h2>
            <FeatureCarousel properties={data.featuredApartments} emptyMessage="Featured apartments will appear here soon." />
          </div>
        </section>

        {data.banners.length > 0 ? (
          <section className="section-banner migrated-banner">
            <FeatureCarousel
              banners={data.banners}
              emptyMessage=""
              variant="banner"
            />
          </section>
        ) : null}

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
                    <img src={icon} width="40" alt="" />
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
            <img src="/assets/images/section/section-help.png" alt="" />
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
                    <img src={image} alt="" />
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
    <div className="heading-section text-center mb-48">
      <h2 className="title">{title}</h2>
      {text ? <p className="text-1">{text}</p> : null}
    </div>
  );
}

function CardRail({
  cards,
}: {
  cards: readonly (readonly [string, string, string, string])[];
}) {
  return (
    <div className="migrated-card-rail mb-40">
      {cards.map(([title, href, image, text]) => (
        <article className="box-house hover-img" key={title}>
          <div className="image-wrap">
            <Link href={href}>
              <img src={image} alt="" />
            </Link>
          </div>
          <div className="content">
            <h5 className="title">
              <Link href={href}>{title}</Link>
            </h5>
            <p className="location text-1">{text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
