import Link from "next/link";
import { Mail, Phone } from "lucide-react";
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
] as const;

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/share/1Bz4FQeYEu/", icon: "icon-fb text-sm!" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/majestanrealty?igsh=cnJycTlqanR6Zmd6",
    icon: "icon-ins text-sm!",
  },
  { label: "YouTube", href: "https://www.youtube.com/@MajestanRealty", icon: "i-yt text-sm!" },
] as const;

export function SiteFooter() {
  return (
    <>
      {/* ── Popular Searches ────────────────────────────────────────────────
          Reverted to the original pill-chip treatment at the client's request.
          Do not restyle this without asking. */}
      <section className="relative! z-10! w-full! bg-white! border-t! border-gray-100! py-14! font-['Lexend',sans-serif]!">
        <div className="container! mx-auto! px-4! md:px-6! lg:px-8!">
          {/* Heading */}
          <div className="flex! items-center! gap-3! mb-8!">
            <p className="text-md! font-semibold! uppercase! text-[#27427f]!">Popular Searches</p>
          </div>

          <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-4! gap-6!">
            {quickLinks.map(({ category, prefix, locations }) => (
              <div key={category}>
                {/* Category label */}
                <p className="text-[13px]! font-bold! text-[#161e2d]! mb-3! pb-2! border-b! border-gray-100! tracking-wide! transition-all! duration-300!">
                  {category}{" "}
                  <span>in Coimbatore</span>
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

      {/* ── Footer ──────────────────────────────────────────────────────────
          Very dark navy. #27427f was too light; #161e2d is the near-black blue
          the footer originally used and is what was asked for. Text steps down
          in white opacity rather than grey, because grey-on-this-navy lands
          around 3.9:1 while white/65 clears AA comfortably for the small type. */}
      <footer className="font-manrope-page relative! z-10! w-full! bg-[#161e2d]! pt-[40px]! pb-[26px]! text-white!">
        <div className="container! mx-auto! px-4! md:px-6! lg:px-8!">
          <div className="grid! grid-cols-1! lg:grid-cols-12! gap-10! lg:gap-8! pb-[34px]!">
            {/* Brand & contact — label over value, no icon discs. */}
            <div className="lg:col-span-4!">
              <Link href="/" className="inline-block!" aria-label="Majestan Realty home">
                <Image
                  src="/assets/images/logo/logo-white.png"
                  alt="Majestan Realty"
                  width={200}
                  height={48}
                  className="object-contain!"
                />
              </Link>

              <p className="mt-[16px]! max-w-[34ch]! text-[14px]! leading-[1.65]! text-white/70!">
                Your trusted real estate partner for buying, renting, and selling properties in
                Coimbatore. Excellence in every transaction.
              </p>

              <dl className="mt-[22px]! border-t! border-white/12!">
                <div className="grid! grid-cols-[7rem_1fr]! items-baseline! gap-x-3! py-[11px]! border-b! border-white/12!">
                  <dt className="text-[11px]! uppercase! tracking-[0.1em]! text-white/55!">
                    Call us
                  </dt>
                  <dd className="m-0!">
                    <a
                      href="tel:+919092965556"
                      className="group inline-flex! items-center! gap-2! text-[14px]! text-white/70! no-underline! transition-colors! duration-150! hover:text-white!"
                    >
                      <Phone
                        className="w-[14px]! h-[14px]! text-white/55! shrink-0! transition-colors! duration-150! group-hover:text-white!"
                        aria-hidden="true"
                      />
                      +91 90929 65556
                    </a>
                  </dd>
                </div>

                <div className="grid! grid-cols-[7rem_1fr]! items-baseline! gap-x-3! py-[11px]! border-b! border-white/12!">
                  <dt className="text-[11px]! uppercase! tracking-[0.1em]! text-white/55!">
                    Email us
                  </dt>
                  <dd className="m-0!">
                    <a
                      href="mailto:info@majestanrealty.com"
                      className="group inline-flex! items-center! gap-2! text-[14px]! text-white/70! no-underline! transition-colors! duration-150! hover:text-white!"
                    >
                      <Mail
                        className="w-[14px]! h-[14px]! text-white/55! shrink-0! transition-colors! duration-150! group-hover:text-white!"
                        aria-hidden="true"
                      />
                      info@majestanrealty.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Link columns */}
            <div className="lg:col-span-8!">
              <div className="grid! grid-cols-2! sm:grid-cols-4! gap-x-6! gap-y-8!">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-[13px]! font-medium! text-white! mb-[14px]!">
                      {column.title}
                    </h3>
                    <ul>
                      {column.links.map(([text, href]) => (
                        <li key={href}>
                          {/*
                            The rule wipes in from the left on hover rather than
                            appearing via `hover:underline`, which is a discrete
                            jump. Same intent, but it reads as deliberate rather
                            than as the browser default.
                          */}
                          <Link
                            href={href}
                            className="group relative! inline-block! py-[5px]! text-[13px]! text-white/70! no-underline! transition-colors! duration-150! hover:text-white!"
                          >
                            {text}
                            {/*
                              `transition-scale`, not `transition-transform`:
                              Tailwind v4 emits scale utilities against the CSS
                              `scale` property (`scale: var(--tw-scale-x) ...`),
                              which is a different property from `transform`.
                              Animating `transform` here left the rule snapping
                              between 0 and 100% with no motion.
                            */}
                            <span
                              aria-hidden="true"
                              className="absolute! left-0! bottom-[3px]! h-px! w-full! origin-left! scale-x-0! bg-white! transition-scale! duration-200! ease-out! group-hover:scale-x-100!"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex! flex-col! sm:flex-row! items-start! sm:items-center! justify-between! gap-4! border-t! border-white/12! pt-[20px]!">
            <p className="text-[13px]! text-white/60!">
              © {new Date().getFullYear()}{" "}
              <span className="font-medium! text-white!">Majestan Realty</span>. All rights
              reserved.
            </p>

            <div className="flex! items-center! gap-3!">
              <span className="text-[11px]! uppercase! tracking-[0.1em]! text-white/55!">
                Follow us
              </span>
              <ul className="flex! items-center! gap-2!">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex! items-center! justify-center! w-[30px]! h-[30px]! rounded-full! border! border-white/20! text-white/70! transition-colors! duration-150! hover:border-white! hover:text-white!"
                    >
                      <i className={social.icon} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
