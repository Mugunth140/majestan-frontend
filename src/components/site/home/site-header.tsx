import Link from "next/link";

const city = "coimbatore";

const buyLinks = [
  ["Apartments", `/buy-apartments-${city}`],
  ["Villas", `/buy-villas-${city}`],
  ["Independent Houses", `/buy-independent-houses-${city}`],
  ["Plots", `/buy-plots-${city}`],
  ["Farmlands", `/buy-farmlands-${city}`],
  ["Commercial Spaces", `/buy-commercial-space-${city}`],
  ["Industrials", `/buy-industrials-${city}`],
] as const;

const rentLinks = [
  ["Commercial", `/rent-commercial-space-${city}`],
  ["Industrial", `/rent-industrials-${city}`],
  ["Apartment", `/rent-apartments-${city}`],
  ["Villa", `/rent-villas-${city}`],
  ["Independent House", `/rent-independent-houses-${city}`],
  ["Co-Working", `/rent-co-working-${city}`],
] as const;

const serviceLinks = [
  ["Property Management", "/services/property-management"],
  ["Liaisoning Service", "/services/liaisoning"],
  ["Brokerage Service", "/services/professional-brokerage-services"],
  ["Financial Assistance", "/services/financial-assistance"],
  ["NRI", "/services/nri-property-investment"],
] as const;

export function SiteHeader() {
  return (
    <header id="header-main" className="header style-4 header-fixed migrated-header">
      <div className="header-inner">
        <div className="tf-container xl">
          <div className="header-inner-wrap">
            <div className="header-logo">
              <Link href="/" className="site-logo">
                <img id="logo_header" alt="Majestan Realty" src="/assets/images/logo/logo.png" />
              </Link>
            </div>

            <nav className="main-menu migrated-nav" aria-label="Main navigation">
              <NavGroup label="Buy" links={buyLinks} />
              <NavGroup label="Rent" links={rentLinks} />
              <NavGroup label="Services" links={serviceLinks} />
              <Link href="/contact-us">Contact</Link>
            </nav>

            <div className="header-right">
              <Link href="/wishlist" className="migrated-wishlist" aria-label="Wishlist">
                <i className="fa-solid fa-heart" />
              </Link>
              <div className="btn-add">
                <Link className="tf-btn style-border pd-23" href="/rent-or-sell-your-property">
                  Rent / Sell Your Property
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavGroup({
  label,
  links,
}: {
  label: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <details className="migrated-nav-group">
      <summary>
        {label} <i className="icon-CaretDown" />
      </summary>
      <ul className="submenu">
        {links.map(([text, href]) => (
          <li key={href}>
            <Link href={href}>{text}</Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
