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
          Pill-chip treatment styled with Manrope typography (normal to bold weights). */}
      <section className="font-manrope-page relative! z-10! w-full! bg-white! border-t! border-gray-100! py-14!">
        <div className="container! mx-auto! px-4! md:px-6! lg:px-8!">
          {/* Heading */}
          <div className="flex! items-center! gap-3! mb-8!">
            <p className="text-[15px]! font-bold! tracking-wide! uppercase! text-[#27427f]!">Popular Searches</p>
          </div>

          {/* ── Mobile: snap rail. md+: the four-column grid. ────────────────
              A flex row on small screens and a grid from md up, so the two
              layouts are one DOM tree rather than two copies of the links.
              The negative margin + matching padding bleeds the rail to the
              viewport edge, so a partially-visible card reads as "scroll me"
              instead of being clipped by the container gutter.

              scroll-pl/pr is load-bearing, not decoration. Scroll-snap resolves
              the snapport from the padding BOX, which excludes padding — so
              with mandatory snapping the browser auto-scrolls the rail on load
              by the full padding to flush the first card against the border
              edge, and that card lands 14px left of the heading and of the
              footer text below. scroll-padding re-declares where the real
              content edge is, so the first card snaps to 14px and aligns. Kept
              in lockstep with the px-4 above (both are 1rem = 14px here, since
              styles.css sets the root to 14px rather than 16px).

              Cards are snap-start at a near-full width: wide enough to read
              the category and two chips, narrow enough that the next card
              peeks in as the affordance. */}
          <div className="flex! flex-nowrap! gap-4! overflow-x-auto! overscroll-x-contain! snap-x! snap-mandatory! hide-scrollbar -mx-4! px-4! pb-2! scroll-pl-4! scroll-pr-4! md:mx-0! md:px-0! md:pb-0! md:scroll-pl-0! md:scroll-pr-0! md:overflow-visible! md:snap-none! md:grid! md:grid-cols-2! md:gap-6! lg:grid-cols-4!">
            {quickLinks.map(({ category, prefix, locations }) => (
              <div
                key={category}
                className="w-[85%]! shrink-0! snap-start! md:w-auto! md:shrink!"
              >
                {/* Category label */}
                <p className="text-[13px]! font-bold! text-[#161e2d]! mb-3! pb-2! border-b! border-gray-100! tracking-wide! transition-all! duration-300!">
                  {category} in Coimbatore
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
          around 3.9:1 while white/65 clears AA comfortably for the small type.

          Layout: the content is one centred column rather than a full-bleed
          band. `container` resolved to 1152px from xl up, which at wide
          viewports left the brand hard against the left gutter and flung the
          social icons to the far right, so the footer read as two unrelated
          halves. An explicit max-w keeps the whole footer — brand, link
          columns and bottom bar — inside one narrower centred column, and the
          bottom bar is then centred as a group rather than justified to
          opposite edges. Both share this single wrapper so they cannot drift. */}
      <footer className="font-manrope-page relative! z-10! w-full! bg-[#161e2d]! pt-[40px]! pb-[26px]! text-white!">
        <div className="mx-auto! w-full! max-w-[1080px]! px-4! md:px-6! lg:px-8!">
          <div className="grid! grid-cols-1! lg:grid-cols-12! gap-10! lg:gap-8! pb-[34px]!">
            {/* Brand & contact — label over value, no icon discs.
                Centred on mobile, left-aligned from lg up: the logo is an
                inline-block so it follows text-align, while the blurb and the
                contact rows are blocks/flex items that need their own alignment
                (mx-auto / items-center on mobile, mx-0 / items-start on lg)
                to sit with the text rather than flush to one side. */}
            <div className="lg:col-span-4! text-center! lg:text-left!">
              <Link href="/" className="inline-block!" aria-label="Majestan Realty home">
                <Image
                  src="/assets/images/logo/logo-white.png"
                  alt="Majestan Realty"
                  width={200}
                  height={48}
                  className="object-contain!"
                />
              </Link>

              <p className="mt-[16px]! mx-auto! lg:mx-0! max-w-[34ch]! text-[14px]! leading-[1.65]! text-white/70!">
                Your trusted real estate partner for buying, renting, and selling properties in
                Coimbatore. Excellence in every transaction.
              </p>

              <div className="mt-6! flex! flex-col! items-center! lg:items-start! gap-3!">
                <a
                  href="tel:+919092965556"
                  className="group inline-flex! items-center! gap-2.5! text-[14px]! text-white/70! no-underline! transition-colors! duration-150! hover:text-white!"
                >
                  <Phone
                    className="w-4! h-4! text-white/55! shrink-0! transition-colors! duration-150! group-hover:text-white!"
                    aria-hidden="true"
                  />
                  <span>+91 90929 65556</span>
                </a>

                <a
                  href="mailto:info@majestanrealty.com"
                  className="group inline-flex! items-center! gap-2.5! text-[14px]! text-white/70! no-underline! transition-colors! duration-150! hover:text-white!"
                >
                  <Mail
                    className="w-4! h-4! text-white/55! shrink-0! transition-colors! duration-150! group-hover:text-white!"
                    aria-hidden="true"
                  />
                  <span>info@majestanrealty.com</span>
                </a>
              </div>
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

          {/* Bottom bar — centred as one group.
              Was justify-between, which pinned the copyright to the left gutter
              and the social icons to the right edge. items-center (not
              items-start) so the cross-axis centring holds in the stacked
              mobile layout too, and the gap grows on sm to keep the pair from
              crowding once they sit on one line. */}
          <div className="flex! flex-col! sm:flex-row! items-center! justify-center! gap-3! sm:gap-8! border-t! border-white/12! pt-[20px]!">
            <p className="text-[13px]! text-center! text-white/60! sm:text-left!">
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
