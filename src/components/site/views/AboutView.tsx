/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */

const whyChooseUsItems = [
  {
    image: "/assets/images/about/wide-range.png",
    title: "Wide Range of Properties",
    description:
      "From residential villas to industrial spaces and farm lands, we cater to all property needs.",
  },
  {
    image: "/assets/images/about/prime_locations.png",
    title: "Prime Locations",
    description:
      "Properties in Coimbatore's urban, industrial and rural zones with great potential for growth.",
  },
  {
    image: "/assets/images/about/comprehensive-services.png",
    title: "Comprehensive Services",
    description:
      "Expertise in property management, liaisoning, and industrial and farmland transactions.",
  },
  {
    image: "/assets/images/about/transparency-and-integrity.png",
    title: "Transparency and Integrity",
    description: "Ethical practices, clear processes, and full legal compliance.",
  },
  {
    image: "/assets/images/about/customer-centric-solutions.png",
    title: "Customer-Centric Solutions",
    description:
      "Tailored services designed to meet the specific needs of property buyers, sellers, and investors.",
  },
] as const;

const coreServiceItems = [
  {
    href: "/property/apartment",
    image: "/assets/images/about/residential-roperties.png",
    label: "Apartment Properties",
  },
  {
    href: "/property/commercial",
    image: "/assets/images/about/commercial-leasing-and-sales.png",
    label: "Commercial Leasing and Sales",
  },
  {
    href: "/property/industrial",
    image: "/assets/images/about/industrial-properties.png",
    label: "Industrial Properties",
  },
  {
    href: "/property/farmland",
    image: "/assets/images/about/farmlands.png",
    label: "Farmland Properties",
  },
  {
    href: "/services/liaisoning",
    image: "/assets/images/about/liaisoning-services.png",
    label: "Liaisoning Services",
  },
  {
    href: "/services/property-management",
    image: "/assets/images/about/property-management-services.png",
    label: "Property Management Services",
  },
  {
    href: "/property/plots",
    image: "/assets/images/about/plotted-developments.png",
    label: "Plotted Developments",
  },
] as const;

export function AboutView(): React.JSX.Element {
  return (
    <>
      <section className="flat-title">
        <div className="tf-container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner">
                <ul className="breadcrumb">
                  <li>
                    <a className="home fw-6 text-color-3" href="/">
                      Home
                    </a>
                  </li>
                  <li>About Us</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="main-content">
        <section className="section-box-team style-2 tf-spacing-4">
          <div className="tf-container">
            <div className="row">
              <div className="col-lg-6">
                <div className="content-inner">
                  <div className="heading-section">
                    <h2 className="title">About Us</h2>
                  </div>
                  <div
                    className="content mb-48 wow animate__fadeInUp animate__animated"
                    data-wow-duration="1s"
                    data-wow-delay="0s"
                  >
                    <p className="text-1 description-1 mb-16">
                      Welcome to Majestan Realty, your trusted partner for comprehensive real
                      estate services, property management, liaisoning, and specialized expertise in
                      industrial properties and farm lands in Coimbatore. With a focus on property
                      sales, commercial leasing, residential developments, and end-to-end management
                      solutions, we are dedicated to meeting the diverse needs of property buyers,
                      sellers, and investors. Whether you are looking for DTCP-approved plots,
                      luxurious villas, commercial spaces, industrial properties, or farm lands,
                      Majestan Realty offers professional services with a commitment to
                      transparency, integrity, and customer satisfaction.
                    </p>
                    <div className="meet-team">
                      <a
                        href="/contact-us"
                        className="tf-btn bg-color-primary pd-12 fw-7 wow animate__fadeInUp animate__animated"
                        data-wow-duration="1s"
                        data-wow-delay="0s"
                      >
                        Meet The Team
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="wrap-image relative">
                  <div
                    className="image-wrap hover-img-wrap img-1 animate__zoomIn wow animate__animated"
                    data-wow-duration="2s"
                  >
                    <img
                      className="lazyload parallax-img"
                      data-src="/assets/images/section/about-1.png"
                      src="/assets/images/section/about-1.png"
                      alt="About Majestan Realty"
                    />
                  </div>
                  <div
                    className="image-wrap hover-img-wrap img-2 animate__zoomIn wow animate__animated"
                    data-wow-duration="2s"
                  >
                    <img
                      className="lazyload parallax-img"
                      data-src="/assets/images/section/about-2.png"
                      src="/assets/images/section/about-2.png"
                      alt="Majestan Realty team"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sale tf-spacing-6">
          <div className="box-sale" />
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="tf-grid-layout md-col-2">
                  <div
                    className="icons-box style-7 effec-icon wow animate__zoomIn animate__animated"
                    data-wow-duration="1s"
                    data-wow-delay="0s"
                  >
                    <div className="tf-icon text-center">
                      <img src="/assets/images/about/vision.png" alt="Our vision" />
                    </div>
                    <h4 className="title text-center">
                      <a href="#">Our Vision</a>
                    </h4>
                    <p className="text-center text-1">
                      To be Coimbatore&apos;s leading real estate company, providing innovative
                      solutions across residential, commercial, industrial, and agricultural sectors
                      while ensuring superior customer experiences.
                    </p>
                  </div>

                  <div
                    className="icons-box style-7 effec-icon wow animate__zoomIn animate__animated"
                    data-wow-duration="1s"
                    data-wow-delay="0s"
                  >
                    <div className="tf-icon text-center">
                      <img src="/assets/images/about/mission.png" alt="Our mission" />
                    </div>
                    <h4 className="title text-center">
                      <a href="#">Our Mission</a>
                    </h4>
                    <p className="text-center text-1">
                      To offer seamless and comprehensive real estate services, including property
                      transactions, management, and liaisoning, while addressing the diverse needs
                      of urban, industrial, and rural property markets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-selling-home section-why tf-spacing-1">
          <div className="tf-container">
            <div className="row">
              <div className="col-12">
                <div className="heading-section mb-48 text-center">
                  <h2 className="title">Why Choose Us?</h2>
                  <p
                    className="text-1 wow animate__fadeInUp animate__animated"
                    data-wow-duration="1.5s"
                    data-wow-delay="0s"
                  >
                    Here are a few reasons why clients choose Majestan Realty for buying, selling,
                    and investing in Coimbatore.
                  </p>
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
                    {whyChooseUsItems.map((item) => (
                      <div className="swiper-slide" key={item.title}>
                        <div className="icons-box effec-icon style-5">
                          <div className="tf-icon">
                            <img src={item.image} alt={item.title} />
                          </div>
                          <h5 className="title text-center">
                            <a href="#">{item.title}</a>
                          </h5>
                          <p className="text-1 text-center">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sw-wrap-btn">
                    <div className="swiper-button-prev sw-button layout-3-prev">
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
                    <div className="sw-pagination sw-pagination-layout-3 text-center" />
                    <div className="swiper-button-next sw-button layout-3-next">
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

        <section className="section-neighborhoods style-2 tf-spacing-1">
          <div className="tf-container full">
            <div className="row">
              <div className="col-12">
                <div className="heading-section mb-46 text-center">
                  <h2 className="title">Our Core Services</h2>
                </div>

                <div
                  className="swiper sw-layout-4-v2 style-pagination"
                  data-preview="4"
                  data-tablet="3"
                  data-mobile-sm="2"
                  data-mobile="1"
                  data-space="12"
                  data-space-md="12"
                  data-space-lg="12"
                  data-speed="1000"
                >
                  <div className="swiper-wrapper mb-48 wrap-neighborhoods">
                    {coreServiceItems.map((item) => (
                      <div className="swiper-slide" key={item.label}>
                        <div className="box-location hover-img">
                          <div className="image-wrap">
                            <a href={item.href}>
                              <img
                                className="lazyload"
                                data-src={item.image}
                                src={item.image}
                                alt={item.label}
                              />
                            </a>
                          </div>
                          <div className="content">
                            <a href={item.href}>
                              <p
                                className="text-1 tf-btn style-border pd-23 text-white"
                                style={{ fontSize: "14px" }}
                              >
                                {item.label} <i className="icon-arrow-right" />
                              </p>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sw-wrap-btn">
                    <div className="swiper-button-prev sw-button layout-4-prev">
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
                    <div className="sw-pagination sw-pagination-layout-4 text-center" />
                    <div className="swiper-button-next sw-button layout-4-next">
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
