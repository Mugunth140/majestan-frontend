import Link from "next/link";

const city = "coimbatore";

const footerColumns = [
  {
    title: "Company",
    links: [
      ["Home", "/"],
      ["About Us", "/about-us"],
      ["Blogs", "/blogs"],
      ["Contact Us", "/contact-us"],
      ["Privacy Policy", "/privacy-policy"],
    ],
  },
  {
    title: "Buy",
    links: [
      ["Apartments", `/buy-apartments-${city}`],
      ["Villas", `/buy-villas-${city}`],
      ["Independent Houses", `/buy-independent-houses-${city}`],
      ["Plots", `/buy-plots-${city}`],
      ["Farmlands", `/buy-farmlands-${city}`],
      ["Commercial Spaces", `/buy-commercial-${city}`],
      ["Industrials", `/buy-industrials-${city}`],
    ],
  },
  {
    title: "Rent",
    links: [
      ["Commercial", `/rent-commercial-space-${city}`],
      ["Industrial", `/rent-industrials-${city}`],
      ["Apartment", `/rent-apartments-${city}`],
      ["Villa", `/rent-villas-${city}`],
      ["Independent House", `/rent-independent-houses-${city}`],
    ],
  },
  {
    title: "Service",
    links: [
      ["Property Management", "/services/property-management"],
      ["Liaisoning Service", "/services/liaisoning"],
      ["Brokerage Service", "/services/professional-brokerage-services"],
      ["Financial Assistance", "/services/financial-assistance"],
      ["NRI", "/services/nri-property-investment"],
    ],
  },
] as const;

const quickLinks = [
  ["Flats for Sale in Coimbatore", "flats-sale", ["Saravanampatti", "Kalapatti", "Peelamedu", "Vilankurunchi", "Vadavalli"]],
  ["Villa for Sale in Coimbatore", "villas-sale", ["Saravanampatti", "Kalapatti", "Peelamedu", "Vilankurunchi", "Vadavalli"]],
  ["Plots for Sale in Coimbatore", "plots-sale", ["Saravanampatti", "Pappampatti", "Sulur", "Periyanaikenpalayam", "Kinathukadavu"]],
  ["Commercial Space for Rent in Coimbatore", "commercialspace-rent", ["Gandhipuram", "Peelamedu", "Ganapathy", "Sai Baba Colony", "Kalapatti"]],
] as const;

export function SiteFooter() {
  return (
    <>
      <section className="section-popular-searches quick-links-footer tf-spacing-1">
        <div className="tf-container md">
          <div className="migrated-quick-links">
            {quickLinks.map(([title, prefix, locations]) => (
              <div key={title}>
                <h5 className="mb-3">{title}</h5>
                <ul className="q-links">
                  {locations.map((location) => {
                    const slug = location.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <li key={location}>
                        <Link href={`/${prefix}-${slug}`}>
                          {title.replace("Coimbatore", location)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="footer">
        <div className="tf-container">
          <div className="footer-top">
            <div className="footer-logo">
              <Link href="/">
                <img id="logo_footer" src="/assets/images/logo/logo-white.png" alt="Majestan Realty" />
              </Link>
            </div>
            <div className="footer-contact">
              <div className="contact-item">
                <i className="fa-solid fa-phone" />
                <div className="content">
                  <div className="title text-1">Call us</div>
                  <h6 className="contact_us1">+91 90929 65556</h6>
                </div>
              </div>
              <div className="contact-item">
                <i className="fa-solid fa-envelope" />
                <div className="content">
                  <div className="title text-1">Need live help</div>
                  <h6 className="fw-4 contact_us1">info@majestanrealty.com</h6>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-main">
            <div className="row">
              {footerColumns.map((column) => (
                <div className="col-lg-2 col-md-6" key={column.title}>
                  <div className="footer-menu-list footer-col-block">
                    <h5 className="title lh-30">{column.title}</h5>
                    <ul className="tf-collapse-content">
                      {column.links.map(([text, href]) => (
                        <li key={href}>
                          <Link href={href}>{text}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              <div className="col-lg-4 col-md-6">
                <div className="footer-menu-list footer-col-block">
                  <h5 className="title lh-30">Contact Us</h5>
                  <ul className="tf-collapse-content">
                    <li>+91 90929 65556</li>
                    <li>info@majestanrealty.com</li>
                    <li>47/1 Aandal Street, Lakshmipuram Main Rd, Hope College, Coimbatore, Tamil Nadu 641004.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              Copyright © {new Date().getFullYear()} <span className="fw-7">Majestan Realty</span>
            </p>
            <div className="wrap-social">
              <div className="text-3 fw-6 text-white">Follow us</div>
              <ul className="tf-social">
                <li>
                  <a href="https://www.facebook.com/share/1Bz4FQeYEu/" aria-label="Facebook">
                    <i className="icon-fb" />
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/majestanrealty?igsh=cnJycTlqanR6Zmd6" aria-label="Instagram">
                    <i className="icon-ins" />
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@MajestanRealty" aria-label="YouTube">
                    <i className="i-yt" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
