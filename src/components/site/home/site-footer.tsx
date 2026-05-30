import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";

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
      ["Apartments", `/for-sale/apartments/${city}`],
      ["Villas", `/for-sale/villas/${city}`],
      ["Independent Houses", `/for-sale/independent-houses/${city}`],
      ["Plots", `/for-sale/plots/${city}`],
      ["Farmlands", `/for-sale/farmlands/${city}`],
      ["Commercial Spaces", `/for-sale/commercial-spaces/${city}`],
      ["Industrials", `/for-sale/industrial-spaces/${city}`],
    ],
  },
  {
    title: "Rent",
    links: [
      ["Commercial", `/for-rent/commercial-spaces/${city}`],
      ["Industrial", `/for-rent/industrial-spaces/${city}`],
      ["Apartment", `/for-rent/apartments/${city}`],
      ["Villa", `/for-rent/villas/${city}`],
      ["Independent House", `/for-rent/independent-houses/${city}`],
    ],
  },
  {
    title: "Services",
    links: [
      ["Property Management", "/services/property-management"],
      ["Liaisoning", "/services/liaisoning"],
      ["Brokerage", "/services/professional-brokerage-services"],
      ["Financial Assistance", "/services/financial-assistance"],
      ["NRI Services", "/services/nri-property-investment"],
    ],
  },
] as const;

const quickLinks = [
  {
    category: "Flats for Sale",
    prefix: "for-sale/apartments",
    locations: ["Saravanampatti", "Kalapatti", "Peelamedu", "Vilankurunchi", "Vadavalli"],
  },
  {
    category: "Villas for Sale",
    prefix: "for-sale/villas",
    locations: ["Saravanampatti", "Kalapatti", "Peelamedu", "Ganapathy", "Vadavalli"],
  },
  {
    category: "Plots for Sale",
    prefix: "for-sale/plots",
    locations: ["Saravanampatti", "Pappampatti", "Sulur", "Periyanaikenpalayam", "Kinathukadavu"],
  },
  {
    category: "Commercial for Rent",
    prefix: "for-rent/commercial-spaces",
    locations: ["Gandhipuram", "Peelamedu", "Ganapathy", "Sai Baba Colony", "Kalapatti"],
  },
];

export function SiteFooter() {
  return (
    <>
      {/* ── Popular Searches — Light Mode Section ── */}
      <section className="w-full! bg-white! border-t! border-gray-100! py-14! font-['Lexend',sans-serif]!">
        <div className="container! mx-auto! px-4! md:px-6! lg:px-8!">
          {/* Heading */}
          <div className="flex! items-center! gap-3! mb-8!">
            <p className="text-md! font-semibold! uppercase! text-[#27427f]!">Popular Searches</p>
          </div>

          <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-4! gap-6!">
            {quickLinks.map(({ category, prefix, locations }) => (
              <div key={category}>
                {/* Category label */}
                <p className="text-[13px]! font-bold! text-[#161e2d]! mb-3! pb-2! border-b! border-gray-100! tracking-wide!">
                  {category}{" "}
                  <span >in Coimbatore</span>
                </p>
                {/* Location pill tags */}
                <div className="flex! flex-wrap! gap-2!">
                  {locations.map((location) => {
                    const slug = location.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <Link
                        key={location}
                        href={`/${prefix}/${city}/${slug}`}
                        className="inline-block! px-3! py-1.5! rounded-lg! bg-[#f4f6fb]! text-[#27427f]! text-[13px]! font-semibold! border! border-[#27427f]/8! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-sm! transition-all! duration-200!"
                      >
                        {location}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark Footer ── */}
      <footer className="w-full! bg-[#161e2d]! pt-16! pb-10! text-white! font-['Lexend',sans-serif]!">
        <div className="container! mx-auto! px-4! md:px-6! lg:px-8!">

          <div className="grid! grid-cols-1! lg:grid-cols-12! gap-12! lg:gap-8! mb-14!">

            {/* Brand & Contact */}
            <div className="lg:col-span-4! space-y-8!">
              <Link href="/" className="inline-block!">
                <Image
                  src="/assets/images/logo/logo-white.png"
                  alt="Majestan Realty"
                  width={200}
                  height={48}
                  className="object-contain!"
                />
              </Link>

              <p className="text-gray-400! text-sm! leading-relaxed! max-w-xs!">
                Your trusted real estate partner for buying, renting, and selling properties in Coimbatore. Excellence in every transaction.
              </p>

              <div className="space-y-4!">
                <a href="tel:+919092965556" className="flex! items-center! gap-4! group!">
                  <div className="w-11! h-11! rounded-full! bg-white/5! group-hover:bg-[#ffc900]! flex! items-center! justify-center! shrink-0! transition-colors!">
                    <Phone className="w-4! h-4! text-[#ffc900]! group-hover:text-[#161e2d]!" />
                  </div>
                  <div>
                    <p className="text-[11px]! text-gray-500! uppercase! tracking-widest! font-semibold! mb-0.5!">Call Us</p>
                    <p className="font-bold! text-white! text-sm! group-hover:text-[#ffc900]! transition-colors!">+91 90929 65556</p>
                  </div>
                </a>

                <a href="mailto:info@majestanrealty.com" className="flex! items-center! gap-4! group!">
                  <div className="w-11! h-11! rounded-full! bg-white/5! group-hover:bg-[#ffc900]! flex! items-center! justify-center! shrink-0! transition-colors!">
                    <Mail className="w-4! h-4! text-[#ffc900]! group-hover:text-[#161e2d]!" />
                  </div>
                  <div>
                    <p className="text-[11px]! text-gray-500! uppercase! tracking-widest! font-semibold! mb-0.5!">Email Us</p>
                    <p className="font-bold! text-white! text-sm! group-hover:text-[#ffc900]! transition-colors!">info@majestanrealty.com</p>
                  </div>
                </a>

                <div className="flex! items-start! gap-4! group!">
                  <div className="w-11! h-11! rounded-full! bg-white/5! flex! items-center! justify-center! shrink-0!">
                    <MapPin className="w-4! h-4! text-[#ffc900]!" />
                  </div>
                  <div>
                    <p className="text-[11px]! text-gray-500! uppercase! tracking-widest! font-semibold! mb-0.5!">Office</p>
                    <p className="text-white! text-sm! leading-relaxed!">47/1 Aandal Street, Lakshmipuram Main Rd, Coimbatore, TN 641004</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-8!">
              <div className="grid! grid-cols-2! sm:grid-cols-4! gap-8!">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h5 className="text-white! font-bold! mb-5! text-[15px]! tracking-wide!">{column.title}</h5>
                    <ul className="space-y-3.5!">
                      {column.links.map(([text, href]) => (
                        <li key={href}>
                          <Link
                            href={href}
                            className="text-gray-400! hover:text-[#ffc900]! text-[13px]! font-medium! transition-colors! inline-block! hover:translate-x-1! duration-200!"
                          >
                            {text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="pt-8! border-t! border-white/10! flex! flex-col! sm:flex-row! items-center! justify-between! gap-4!">
            <p className="text-gray-500! text-sm! font-medium!">
              © {new Date().getFullYear()}{" "}
              <span className="text-white! font-bold!">Majestan Realty</span>. All rights reserved.
            </p>

            <div className="flex! items-center! gap-3!">
              <span className="text-gray-600! text-[11px]! font-bold! uppercase! tracking-widest! mr-1!">Follow</span>
              <a
                href="https://www.facebook.com/share/1Bz4FQeYEu/"
                aria-label="Facebook"
                className="w-9! h-9! rounded-full! bg-white/5! flex! items-center! justify-center! text-white! hover:bg-[#ffc900]! hover:text-[#161e2d]! transition-all! hover:-translate-y-0.5!"
              >
                <i className="icon-fb text-sm!" />
              </a>
              <a
                href="https://www.instagram.com/majestanrealty?igsh=cnJycTlqanR6Zmd6"
                aria-label="Instagram"
                className="w-9! h-9! rounded-full! bg-white/5! flex! items-center! justify-center! text-white! hover:bg-[#ffc900]! hover:text-[#161e2d]! transition-all! hover:-translate-y-0.5!"
              >
                <i className="icon-ins text-sm!" />
              </a>
              <a
                href="https://www.youtube.com/@MajestanRealty"
                aria-label="YouTube"
                className="w-9! h-9! rounded-full! bg-white/5! flex! items-center! justify-center! text-white! hover:bg-[#ffc900]! hover:text-[#161e2d]! transition-all! hover:-translate-y-0.5!"
              >
                <i className="i-yt text-sm!" />
              </a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
