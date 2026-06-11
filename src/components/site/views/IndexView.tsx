"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useMemo, useState } from "react";
import { useLocationContext } from "@/contexts/LocationContext";

type Option = {
  label: string;
  value: string;
};

type PropertyTile = {
  title: string;
  href: string;
  image: string;
};

type PropertyCard = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

type FeaturedCard = {
  title: string;
  location: string;
  href: string;
  image: string;
  price: string;
  pricePerSqft: string;
};

type BannerSlide = {
  image: string;
  href: string;
};

type ServiceCard = {
  icon: string;
  title: string;
  description: string;
};

type ProjectCard = {
  title: string;
  count: string;
  image: string;
};

type BlogCard = {
  title: string;
  href: string;
  image: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function IndexView(): React.JSX.Element {
  const { location: contextLocation } = useLocationContext();
  const citySlug = contextLocation.toLowerCase().replace(/[\s,]+/g, '-');
  
  const rotatingWords = ["Buy", "Sell", "Rent"] as const;

const listingTypeOptions: Option[] = [
  { label: "Buy", value: "Sell" },
  { label: "Rent", value: "Rent" },
];

const propertyTypeOptions: Option[] = [
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Independent House", value: "independenthouse" },
  { label: "Plot", value: "plot" },
  { label: "Commercial Space", value: "commercialspace" },
  { label: "Industrial", value: "industrialspace" },
  { label: "Farmlands", value: "farmlands" },
];

const locationOptions: Option[] = [
  { label: "Peelamedu", value: "Peelamedu" },
  { label: "Saravanampatti", value: "Saravanampatti" },
  { label: "Race Course", value: "Race Course" },
  { label: "RS Puram", value: "RS Puram" },
  { label: "Gandhipuram", value: "Gandhipuram" },
  { label: "Avinashi Road", value: "Avinashi Road" },
  { label: "Saibaba Colony", value: "Saibaba Colony" },
  { label: "Thudiyalur", value: "Thudiyalur" },
  { label: "Singanallur", value: "Singanallur" },
];

const unitTypeOptions: Option[] = [
  { label: "1 BHK", value: "1 BHK" },
  { label: "2 BHK", value: "2 BHK" },
  { label: "3 BHK", value: "3 BHK" },
  { label: "4 BHK", value: "4 BHK" },
  { label: "Office", value: "Office" },
  { label: "Warehouse", value: "Warehouse" },
  { label: "Studio", value: "Studio" },
];

const facingOptions: Option[] = [
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "North", value: "north" },
  { label: "South", value: "south" },
];

const priceRangesByListingType: Record<string, Option[]> = {
  Sell: [
    { value: "15L-25L", label: "15L to 25L" },
    { value: "25L-50L", label: "25L to 50L" },
    { value: "50L-75L", label: "50L to 75L" },
    { value: "75L-1.25C", label: "75L to 1.25C" },
    { value: "1.25C-2.25C", label: "1.25C to 2.25C" },
    { value: "2.25C-3.5C", label: "2.25C to 3.5C" },
    { value: "3.5C-5C", label: "3.5C to 5C" },
    { value: "5C", label: "5C and Above" },
  ],
  Rent: [
    { value: "30k-50k", label: "30k to 50k" },
    { value: "50k-75k", label: "50k to 75k" },
    { value: "75k-1L", label: "75k to 1L" },
    { value: "1L-1.25L", label: "1L to 1.25L" },
    { value: "1.25L-1.5L", label: "1.25L to 1.5L" },
    { value: "1.5L-2L", label: "1.5L to 2L" },
    { value: "2L-2.75L", label: "2L to 2.75L" },
    { value: "2.75L-3.5L", label: "2.75L to 3.5L" },
    { value: "3.5L-5L", label: "3.5L to 5L" },
    { value: "5L", label: "5L and Above" },
  ],
};

const propertyTiles: PropertyTile[] = [
  {
    title: "Apartment",
    href: "/property/apartment",
    image: "/assets/images/about/residential-roperties.png",
  },
  {
    title: "Villa",
    href: "/property/villa",
    image: "/assets/images/liaisoning/villa.png",
  },
  {
    title: "Independent House",
    href: "/property/independent-house",
    image: "/assets/images/section/box-house.jpg",
  },
  {
    title: "Plots",
    href: "/property/plots",
    image: "/assets/images/about/plotted-developments.png",
  },
  {
    title: "Commercial Space",
    href: "/property/commercial",
    image: "/assets/images/about/commercial-leasing-and-sales.png",
  },
  {
    title: "Industrial",
    href: "/property/industrial",
    image: "/assets/images/about/industrial-properties.png",
  },
  {
    title: "Farmland",
    href: "/property/farmland",
    image: "/assets/images/about/farmlands.png",
  },
  {
    title: "Co-Working",
    href: "/property/coworking",
    image: "/assets/images/liaisoning/office_space.png",
  },
];

const salePropertyCards: PropertyCard[] = [
  {
    title: "Apartment",
    subtitle: "for sale",
    href: `/buy-apartments-${citySlug}`,
    image: "/assets/images/about/residential-roperties.png",
  },
  {
    title: "Villa",
    subtitle: "for sale",
    href: `/buy-villas-${citySlug}`,
    image: "/assets/images/liaisoning/villa.png",
  },
  {
    title: "Independent Houses",
    subtitle: "for sale",
    href: `/buy-independent-houses-${citySlug}`,
    image: "/assets/images/section/box-house.jpg",
  },
  {
    title: "Plot",
    subtitle: "for sale",
    href: `/buy-plots-${citySlug}`,
    image: "/assets/images/about/plotted-developments.png",
  },
  {
    title: "Commercial Space",
    subtitle: "for sale",
    href: `/buy-commercial-space-${citySlug}`,
    image: "/assets/images/about/commercial-leasing-and-sales.png",
  },
];

const featuredApartmentCards: FeaturedCard[] = [
  {
    title: "Majestan Skyline Apartments",
    location: `Peelamedu, ${contextLocation}`,
    href: `/buy-apartments-${citySlug}`,
    image: "/assets/images/about/residential-roperties.png",
    price: "1.05 Cr",
    pricePerSqft: "₹ 7,200 / Sqft",
  },
  {
    title: "Park Avenue Residences",
    location: `Saravanampatti, ${contextLocation}`,
    href: `/buy-apartments-${citySlug}`,
    image: "/assets/images/section/about-1.png",
    price: "82 L",
    pricePerSqft: "₹ 6,450 / Sqft",
  },
  {
    title: "Green Heights",
    location: `Race Course, ${contextLocation}`,
    href: `/buy-apartments-${citySlug}`,
    image: "/assets/images/section/about-2.png",
    price: "1.28 Cr",
    pricePerSqft: "₹ 8,050 / Sqft",
  },
];

const bannerSlides: BannerSlide[] = [
  {
    image: "/assets/images/section/footer-banner.png",
    href: "/projects",
  },
  {
    image: "/assets/images/section/page-title-1.jpg",
    href: `/buy-apartments-${citySlug}`,
  },
  {
    image: "/assets/images/section/section-realty.jpg",
    href: "/rent-or-sell-your-property",
  },
];

const helpCards: ServiceCard[] = [
  {
    icon: "/assets/images/icons/map.png",
    title: "Find Your Ideal Property",
    description:
      "Browse verified listings for plots, apartments, villas, and commercial spaces with details and visuals.",
  },
  {
    icon: "/assets/images/icons/phone.png",
    title: "Seamless Buying and Leasing",
    description:
      "Get expert assistance from site visits to final closure for a smooth and reliable transaction.",
  },
  {
    icon: "/assets/images/icons/email.png",
    title: "Investor and Seller Support",
    description:
      "Connect with genuine buyers, tenants, and investors to maximize your property value.",
  },
  {
    icon: "/assets/images/icons/assured.png",
    title: "Market Insights and Updates",
    description:
      "Stay informed with real estate trends, investment ideas, and new launch opportunities.",
  },
];

const rentPropertyCards: PropertyCard[] = [
  {
    title: "Office Space",
    subtitle: `for Rent in ${contextLocation}`,
    href: `/rent-commercial-space-${citySlug}`,
    image: "/assets/images/liaisoning/office_space.png",
  },
  {
    title: "Ware House",
    subtitle: `for Rent in ${contextLocation}`,
    href: `/rent-industrials-${citySlug}`,
    image: "/assets/images/liaisoning/wherehouses.png",
  },
  {
    title: "Showroom",
    subtitle: `for Rent in ${contextLocation}`,
    href: `/rent-commercial-space-${citySlug}`,
    image: "/assets/images/liaisoning/retail_space.png",
  },
  {
    title: "Apartment",
    subtitle: `for Rent in ${contextLocation}`,
    href: `/rent-apartments-${citySlug}`,
    image: "/assets/images/about/residential-roperties.png",
  },
  {
    title: "Villa",
    subtitle: `for Rent in ${contextLocation}`,
    href: `/rent-villas-${citySlug}`,
    image: "/assets/images/liaisoning/villa.png",
  },
  {
    title: "Independent Houses",
    subtitle: `for Rent in ${contextLocation}`,
    href: `/rent-independent-houses-${citySlug}`,
    image: "/assets/images/section/box-house.jpg",
  },
];

const featuredVillaCards: FeaturedCard[] = [
  {
    title: "Majestan Valley Villas",
    location: `RS Puram, ${contextLocation}`,
    href: `/buy-villas-${citySlug}`,
    image: "/assets/images/liaisoning/villa.png",
    price: "2.1 Cr",
    pricePerSqft: "₹ 8,900 / Sqft",
  },
  {
    title: "Palm Grove Villas",
    location: `Saravanampatti, ${contextLocation}`,
    href: `/buy-villas-${citySlug}`,
    image: "/assets/images/section/page-title-2.jpg",
    price: "1.75 Cr",
    pricePerSqft: "₹ 7,800 / Sqft",
  },
  {
    title: "Crescent Luxury Villas",
    location: `Avinashi Road, ${contextLocation}`,
    href: `/buy-villas-${citySlug}`,
    image: "/assets/images/section/page-title-3.jpg",
    price: "2.45 Cr",
    pricePerSqft: "₹ 9,250 / Sqft",
  },
];

const projectCards: ProjectCard[] = [
  {
    title: "Ready to Move",
    count: "1545+ Projects",
    image: "/assets/images/section/page-title-1.jpg",
  },
  {
    title: "Under Construction",
    count: "148+ Projects",
    image: "/assets/images/section/page-title-2.jpg",
  },
  {
    title: "New Launch",
    count: "77+ Projects",
    image: "/assets/images/section/page-title-3.jpg",
  },
  {
    title: "Resale",
    count: "77+ Projects",
    image: "/assets/images/section/page-title-4.jpg",
  },
];

const sellerServiceCards: ServiceCard[] = [
  {
    icon: "/assets/images/property-management/property-management-1.png",
    title: "Property Management",
    description:
      "End-to-end support for residential and commercial property management and leasing.",
  },
  {
    icon: "/assets/images/home/rent_sell_property_form.jpg",
    title: "Rent a Property",
    description:
      "List your rental property and connect with reliable tenants through expert support.",
  },
  {
    icon: "/assets/images/home/enquire.png",
    title: "Sell a Property",
    description:
      "Get strategic pricing and dedicated assistance for faster, higher-value closures.",
  },
];

const faqItems: FaqItem[] = [
  {
    id: "one",
    question: `How can I buy a property in ${contextLocation} through Majestan Realty?`,
    answer:
      "Browse apartments, villas, plots, and commercial properties on our website or contact our team for personalized recommendations based on your budget and preferred location.",
  },
  {
    id: "two",
    question: "Do you assist with property registration and legal verification?",
    answer:
      "Yes. We provide complete support including legal verification, documentation, registration, and liaison with the right authorities.",
  },
  {
    id: "three",
    question: "Can I list my property for sale or rent on Majestan Realty?",
    answer:
      "Absolutely. Owners can list apartments, villas, independent houses, and commercial properties for sale or rent to reach genuine buyers and tenants.",
  },
  {
    id: "four",
    question: "Do you offer rental and property management services?",
    answer:
      "Yes. We offer rental assistance, tenant screening, agreement support, and end-to-end property management services.",
  },
  {
    id: "five",
    question: `Is ${contextLocation} a good city for real estate investment?`,
    answer:
      `Yes. ${contextLocation} is one of Tamil Nadu's fastest-growing real estate markets with strong demand across residential, commercial, and industrial segments.`,
  },
];

const blogCards: BlogCard[] = [
  {
    title: `Top Locations to Buy Apartments in ${contextLocation}`,
    href: "/blogs",
    image: "/assets/images/section/page-title-5.jpg",
  },
  {
    title: "How to Evaluate Property Legal Documents Before Purchase",
    href: "/blogs",
    image: "/assets/images/section/our-process.jpg",
  },
  {
    title: `Why ${contextLocation} Continues to Be a Strong Investment Market`,
    href: "/blogs",
    image: "/assets/images/section/section-calculate.jpg",
  },
];

// Extracted to top level to avoid React Compiler errors
function SwiperNav({
  prevClass,
  nextClass,
  paginationClass,
}: {
  prevClass: string;
  nextClass: string;
  paginationClass: string;
}): React.JSX.Element {
  return (
    <div className="sw-wrap-btn">
      <div className={`swiper-button-prev sw-button ${prevClass}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5"
            stroke="#5C5E61"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 19L5 12L12 5"
            stroke="#5C5E61"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={`swiper-pagination sw-pagination ${paginationClass}`} />
      <div className={`swiper-button-next sw-button ${nextClass}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12H19"
            stroke="#5C5E61"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 5L19 12L12 19"
            stroke="#5C5E61"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function FeaturedProjectCard({ card }: { card: FeaturedCard }): React.JSX.Element {
  return (
    <div className="swiper-slide">
      <div className="box-house hover-img">
        <div className="image-wrap">
          <a href={card.href}>
            <img className="lazyload" data-src={card.image} src={card.image} alt={card.title} />
          </a>
        </div>
        <div className="content">
          <h5 className="title">
            <a href={card.href}>{card.title}</a>
          </h5>
          <p className="location text-1 flex items-center gap-6 Featured_Properties">
            <i className="icon-location" />
            {card.location}
          </p>

          <div className="bot flex justify-between items-center">
            <h5 className="price">
              ₹ {card.price}
              <p className="h5 lh-30 fw-4 text-color-default pricesort">{card.pricePerSqft}</p>
            </h5>
            <div className="d-flex gap-2">
              <div className="wrap-btn flex">
                <a href={card.href} className="tf-btn style-border pd-4 property-details-btn">
                  Details
                </a>
              </div>
              <div className="wrap-btn flex">
                <a href="/contact-us" className="tf-btn style-border pd-4 contact-btn">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [listingType, setListingType] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [unitType, setUnitType] = useState<string>("");
  const [facing, setFacing] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveWordIndex((previous) => (previous + 1) % rotatingWords.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  const priceOptions = useMemo<Option[]>(() => {
    return priceRangesByListingType[listingType] ?? [];
  }, [listingType]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!propertyType) {
      setSearchError("Please select a Property Type.");
      return;
    }

    setSearchError("");

    const params = new URLSearchParams({
      listingtype: listingType,
      propertytype: propertyType,
      location,
      unittype: unitType,
      facing,
      price,
    });

    window.location.href = `/home/property_results?${params.toString()}`;
  };

  return (
    <>
      <div className="page-title home04">
        <div className="tf-container">
          <div className="row">
            <div className="col-12">
              <div className="content-inner">
                <div className="heading-title">
                  <h1 className="title" style={{ fontSize: "40px", lineHeight: "55px" }}>
                    Your Trusted Partner to{" "}
                    <span className="rotate-words">
                      {rotatingWords.map((word, index) => (
                        <span key={word} className={index === activeWordIndex ? "active" : ""}>
                          {word}
                        </span>
                      ))}
                    </span>{" "}
                    Properties in {location}
                  </h1>
                </div>

                <div className="widget-tabs style-1">
                  <ul className="widget-menu-tab">
                    {propertyTiles.map((tile) => (
                      <li className="item-title" key={tile.title}>
                        <a href={tile.href}>
                          <div className="d-grid" style={{ justifyItems: "center" }}>
                            <img src={tile.image} width="60" alt={tile.title} />
                            {tile.title}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>

                  <div className="wg-filter">
                    <form className="w-full" onSubmit={handleSearch}>
                      <div className="form-title">
                        <div
                          className="home-filter-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
                            gap: "12px",
                            flex: 1,
                          }}
                        >
                          <select
                            className="form-select"
                            value={listingType}
                            onChange={(event) => {
                              const nextListingType = event.target.value;
                              setListingType(nextListingType);
                              setPrice("");
                            }}
                          >
                            <option value="">Purchase type</option>
                            {listingTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <div>
                            <select
                              className="form-select"
                              value={propertyType}
                              onChange={(event) => {
                                setPropertyType(event.target.value);
                                setSearchError("");
                              }}
                            >
                              <option value="">Property type</option>
                              {propertyTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {searchError ? (
                              <div id="propertytype-error" className="error-tooltip">
                                {searchError}
                              </div>
                            ) : null}
                          </div>

                          <select
                            className="form-select"
                            value={contextLocation}
                            onChange={(event) => setLocation(event.target.value)}
                          >
                            <option value="">Location</option>
                            {locationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="wrap-btn">
                          <button type="submit" className="tf-btn bg-color-primary pd-3" id="searchbutton">
                            Search <i className="icon-MagnifyingGlass fw-6" />
                          </button>
                        </div>
                      </div>

                      <div className="wd-search-form mt-16">
                        <div
                          className="home-filter-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
                            gap: "12px",
                          }}
                        >
                          <select
                            className="form-select"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            disabled={priceOptions.length === 0}
                          >
                            <option value="">Select Price Range</option>
                            {priceOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-select"
                            value={unitType}
                            onChange={(event) => setUnitType(event.target.value)}
                          >
                            <option value="">Various Unit Types</option>
                            {unitTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-select"
                            value={facing}
                            onChange={(event) => setFacing(event.target.value)}
                          >
                            <option value="">Facing</option>
                            {facingOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <section className="sale-in-cbe section-featured-properties tf-spacing-7">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="heading-section text-center mb-48">
                  <h2 className="title">Properties for Sale in {contextLocation}</h2>
                  <p className="text-1 wow animate__fadeInUp animate__animated" data-wow-duration="1.5s" data-wow-delay="0s">
                    Find the best properties for sale in {contextLocation}, from residential homes to
                    commercial spaces.
                  </p>
                </div>

                <div className="heading-section text-left mb-48">
                  <h2 className="title">By Property</h2>
                </div>

                <div
                  className="swiper sw-layout-3 style-pagination mb-40"
                  data-preview="3"
                  data-tablet="3"
                  data-mobile-sm="2"
                  data-mobile="1"
                  data-space="15"
                  data-space-md="30"
                  data-space-lg="40"
                  data-speed="1000"
                >
                  <div className="swiper-wrapper mb-48">
                    {salePropertyCards.map((card) => (
                      <div className="swiper-slide" key={card.title}>
                        <div className="box-house hover-img">
                          <div className="image-wrap">
                            <a href={card.href}>
                              <img className="lazyload" data-src={card.image} src={card.image} alt={card.title} />
                            </a>
                          </div>
                          <div className="content">
                            <h5 className="title">
                              <a href={card.href}>{card.title}</a>
                            </h5>
                            <p className="location text-1">{card.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SwiperNav
                    prevClass="layout-3-prev"
                    nextClass="layout-3-next"
                    paginationClass="sw-pagination-layout-3"
                  />
                </div>

                <div className="heading-section text-left mb-48">
                  <h2 className="title">Featured Apartment Projects in {contextLocation}</h2>
                </div>

                <div
                  className="swiper sw-layout-3 style-pagination"
                  data-preview="3"
                  data-tablet="3"
                  data-mobile-sm="2"
                  data-mobile="1"
                  data-space="15"
                  data-space-md="30"
                  data-space-lg="40"
                  data-speed="1000"
                >
                  <div className="swiper-wrapper mb-48">
                    {featuredApartmentCards.map((card) => (
                      <FeaturedProjectCard key={card.title} card={card} />
                    ))}
                  </div>
                  <SwiperNav
                    prevClass="layout-3-prev"
                    nextClass="layout-3-next"
                    paginationClass="sw-pagination-layout-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-banner">
          <div id="homeBannerCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {bannerSlides.map((slide, index) => (
                <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={slide.image}>
                  <a href={slide.href}>
                    <img src={slide.image} className="d-block w-100" alt="Banner" />
                  </a>
                </div>
              ))}
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#homeBannerCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" />
            </button>

            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#homeBannerCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" />
            </button>

            <div className="carousel-indicators">
              {bannerSlides.map((_, index) => (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  data-bs-target="#homeBannerCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="hwch-section section-help tf-spacing-1 pb-0">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="heading-section text-center">
                  <h2 className="title">How can we help you?</h2>
                  <p className="text-1 wow animate__fadeInUp animate__animated" data-wow-duration="1.5s" data-wow-delay="0s">
                    Supporting you at every stage of your real estate journey.
                  </p>
                </div>

                <div className="tf-grid-layout md-col-2 mb-6">
                  {helpCards.map((card) => (
                    <div
                      className="icons-box style-3 wow animate__zoomIn animate__animated"
                      data-wow-duration="1.5s"
                      data-wow-delay="0s"
                      key={card.title}
                    >
                      <div className="tf-icon">
                        <img src={card.icon} width="40" alt={card.title} />
                      </div>
                      <div className="content">
                        <h5 className="title">{card.title}</h5>
                        <p className="text-1">{card.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="item text-center">
            <img src="/assets/images/section/section-help.png" alt="How we help" />
          </div>
        </section>

        <section className="rent-in-cbe section-best-sale tf-spacing-7">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="heading-section text-center mb-48">
                  <h2 className="title">Properties for Rent in {contextLocation}</h2>
                  <p className="text-1">Find the best rental properties in {contextLocation}, from homes to commercial spaces.</p>
                </div>

                <div className="heading-section text-left mb-48">
                  <h2 className="title">By Property</h2>
                </div>

                <div
                  className="swiper sw-layout-3 style-pagination mb-40"
                  data-preview="3"
                  data-tablet="2"
                  data-mobile-sm="1"
                  data-mobile="1"
                  data-space="15"
                  data-space-md="20"
                  data-space-lg="40"
                  data-speed="1000"
                >
                  <div className="swiper-wrapper mb-48">
                    {rentPropertyCards.map((card) => (
                      <div className="swiper-slide" key={card.title}>
                        <div className="box-house hover-img">
                          <div className="image-wrap">
                            <a href={card.href}>
                              <img className="lazyload" data-src={card.image} src={card.image} alt={card.title} />
                            </a>
                          </div>
                          <div className="content">
                            <h5 className="title">
                              <a href={card.href}>{card.title}</a>
                            </h5>
                            <p className="location text-1">{card.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SwiperNav
                    prevClass="layout-3-prev"
                    nextClass="layout-3-next"
                    paginationClass="sw-pagination-layout-3"
                  />
                </div>

                <div className="heading-section text-left mb-48">
                  <h2 className="title">Featured Villa Projects in {contextLocation}</h2>
                </div>

                <div
                  className="swiper sw-layout-3 style-pagination"
                  data-preview="3"
                  data-tablet="3"
                  data-mobile-sm="2"
                  data-mobile="1"
                  data-space="15"
                  data-space-md="30"
                  data-space-lg="40"
                  data-speed="1000"
                >
                  <div className="swiper-wrapper mb-48">
                    {featuredVillaCards.map((card) => (
                      <FeaturedProjectCard key={card.title} card={card} />
                    ))}
                  </div>
                  <SwiperNav
                    prevClass="layout-3-prev"
                    nextClass="layout-3-next"
                    paginationClass="sw-pagination-layout-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-0 section-categories-neighborhoods tf-spacing-7">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="heading-section text-center mb-48">
                  <h2 className="title">Projects in {contextLocation}</h2>
                </div>

                <div
                  className="swiper sw-layout-3 style-pagination"
                  data-preview="3"
                  data-tablet="3"
                  data-mobile-sm="2"
                  data-mobile="1"
                  data-space="15"
                  data-space-md="30"
                  data-space-lg="40"
                  data-speed="1000"
                >
                  <div className="swiper-wrapper mb-48 wrap-neighborhoods">
                    {projectCards.map((card) => (
                      <div className="swiper-slide" key={card.title}>
                        <div className="box-location h-450 hover-img">
                          <div className="image-wrap">
                            <a href="/projects">
                              <img className="lazyload" data-src={card.image} src={card.image} alt={card.title} />
                            </a>
                          </div>
                          <div className="content">
                            <h6 className="text-white">{card.title}</h6>
                            <a href="/projects" className="text-1 tf-btn style-border pd-23 text-white">
                              {card.count} <i className="icon-arrow-right" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SwiperNav
                    prevClass="layout-3-prev"
                    nextClass="layout-3-next"
                    paginationClass="sw-pagination-layout-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sale">
          <div className="box-sale">
            <div className="tf-container">
              <div className="row">
                <div className="col-12">
                  <div className="heading-section text-center mb-48">
                    <h2 className="title text-white">
                      Sell Your Property Fast with Majestan Realty
                      <br />
                      {contextLocation}&apos;s Trusted Real Estate Partner
                    </h2>
                    <p
                      className="text-1 text-white wow animate__fadeInUp animate__animated"
                      data-wow-duration="1.5s"
                      data-wow-delay="0s"
                    >
                      Expert guidance, quick closures, and maximum value for your home.
                    </p>
                  </div>
                  <a
                    href="/rent-or-sell-your-property"
                    className="tf-btn bg-color-primary pd-12 mx-auto fw-7 wow animate__fadeInUp animate__animated"
                    data-wow-duration="1.5s"
                    data-wow-delay="0s"
                  >
                    Meet The Team
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="tf-grid-layout md-col-3">
                  {sellerServiceCards.map((service) => (
                    <div
                      className="icons-box style-7 effec-icon wow animate__zoomIn animate__animated"
                      data-wow-duration="1s"
                      data-wow-delay="0s"
                      key={service.title}
                    >
                      <div className="tf-icon text-center">
                        <img src={service.icon} alt={service.title} />
                      </div>
                      <h4 className="title text-center">
                        <a href="/rent-or-sell-your-property">{service.title}</a>
                      </h4>
                      <p className="text-center text-1">{service.description}</p>
                      <a href="/rent-or-sell-your-property" className="tf-btn style-border pd-6 fw-7 mx-auto">
                        Find out more
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonal-video tf-spacing-1">
          <div className="tf-container">
            <div className="heading-section text-center mb-48">
              <h2 className="title">What Our Clients Say?</h2>
              <p className="text-1 wow animate__fadeInUp animate__animated" data-wow-duration="1.5s" data-wow-delay="0s">
                Here are a few reasons why homeowners choose Majestan Realty.
              </p>
            </div>

            <iframe
              width="100%"
              height="500"
              src="https://www.youtube.com/embed/awTaQy1nILw?si=h0dOzjZI96X-bbIx"
              title="What Our Clients Say"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <a
              href="https://youtube.com/playlist?list=PLpcgw9UXnejlsiNh0pe7LkuORlsa0VQjr&si=TJy_OEKdVVRkBRFX"
              className="tf-btn mt-5 bg-color-primary pd-12 mx-auto fw-7 wow animate__fadeInUp animate__animated"
              data-wow-duration="1.5s"
              data-wow-delay="0s"
              target="_blank"
              rel="noreferrer"
            >
              Trusted by Many
            </a>
          </div>
        </section>

        <section className="section-faq">
          <div className="tf-container">
            <div className="row">
              <div className="col-xl-12 col-lg-7">
                <div className="heading-section mb-48">
                  <h2 className="title">Frequently Asked Questions</h2>
                </div>

                <div className="tf-faq">
                  <ul className="box-faq" id="wrapper-faq-3">
                    {faqItems.map((item, index) => (
                      <li className={`faq-item ${index === 1 ? "active" : ""}`} key={item.id}>
                        <a
                          href={`#accordion3-faq-${item.id}`}
                          className="faq-header h6 collapsed"
                          data-bs-toggle="collapse"
                          aria-expanded="false"
                          aria-controls={`accordion3-faq-${item.id}`}
                        >
                          {item.question}
                          <i className="icon-CaretDown" />
                        </a>
                        <div
                          id={`accordion3-faq-${item.id}`}
                          className="collapse"
                          data-bs-parent="#wrapper-faq-3"
                        >
                          <p className="faq-body">{item.answer}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-opinion tf-spacing-7">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="heading-section text-center mb-48">
                  <h2 className="title">Realty Check - Blogs</h2>
                  <p className="text-1 wow animate__fadeInUp animate__animated" data-wow-duration="1.5s" data-wow-delay="0s">
                    Stay ahead in real estate with trends, tips, and market updates.
                  </p>
                </div>

                <div
                  className="swiper style-pagination tf-sw-latest"
                  data-preview="3"
                  data-tablet="2"
                  data-mobile-sm="2"
                  data-mobile="1"
                  data-space-lg="40"
                  data-space-md="20"
                  data-space="15"
                >
                  <div className="swiper-wrapper">
                    {blogCards.map((blog) => (
                      <div className="swiper-slide" key={blog.title}>
                        <div className="blog-article-item style-2 hover-img">
                          <div className="image-wrap blogs_img">
                            <a href={blog.href}>
                              <img className="lazyload" data-src={blog.image} src={blog.image} alt={blog.title} />
                            </a>
                          </div>
                          <div className="article-content">
                            <h4 className="title line-clamp-3">
                              <a href={blog.href}>{blog.title}</a>
                            </h4>
                            <a href={blog.href} className="tf-btn-link">
                              <span>Read More</span>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <g clipPath="url(#clip0_2450_13860)">
                                  <path
                                    d="M10.0013 18.3334C14.6037 18.3334 18.3346 14.6024 18.3346 10C18.3346 5.39765 14.6037 1.66669 10.0013 1.66669C5.39893 1.66669 1.66797 5.39765 1.66797 10C1.66797 14.6024 5.39893 18.3334 10.0013 18.3334Z"
                                    stroke="#F1913D"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M6.66797 10H13.3346"
                                    stroke="#F1913D"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10 13.3334L13.3333 10L10 6.66669"
                                    stroke="#F1913D"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_2450_13860">
                                    <rect width="20" height="20" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sw-wrap-btn mt-5">
                    <div className="swiper-button-prev sw-button nav-prev-latest">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M19 12H5"
                          stroke="#5C5E61"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 5L5 12L12 19"
                          stroke="#5C5E61"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="sw-pagination sw-pagination-latest text-center d-lg-none d-block mt-20" />
                    <div className="swiper-button-next sw-button nav-next-latest">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12H19"
                          stroke="#5C5E61"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 5L19 12L12 19"
                          stroke="#5C5E61"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

