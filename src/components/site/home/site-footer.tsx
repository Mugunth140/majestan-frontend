import { SeoFooterContent } from "@/components/seo/core-heading";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { PopularSearches } from "./popular-searches";

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
      ["Apartments", `/apartments-for-sale-in-${city}`],
      ["Villas", `/villas-for-sale-in-${city}`],
      ["Independent Houses", `/independent-houses-for-sale-in-${city}`],
      ["Plots", `/plots-for-sale-in-${city}`],
      ["Farmlands", `/farmlands-for-sale-in-${city}`],
      ["Commercial Spaces", `/commercial-spaces-for-sale-in-${city}`],
      ["Industrials", `/industrial-spaces-for-sale-in-${city}`],
    ],
  },
  {
    title: "Rent",
    links: [
      ["Commercial", `/commercial-spaces-for-rent-in-${city}`],
      ["Industrial", `/industrial-spaces-for-rent-in-${city}`],
      ["Apartment", `/apartments-for-rent-in-${city}`],
      ["Villa", `/villas-for-rent-in-${city}`],
      ["Independent House", `/independent-houses-for-rent-in-${city}`],
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

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1Bz4FQeYEu/",
    // Simple Icons (CC0) — inlined because the legacy icon font is gone
    // and lucide no longer ships brand icons.
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/majestanrealty?igsh=cnJycTlqanR6Zmd6",
    path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@MajestanRealty",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
] as const;

export function SiteFooter() {
  return (
    <>
      <SeoFooterContent />
      <PopularSearches />

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

          {/* Bottom bar — split on desktop: copyright left, socials right
              (sm:justify-between). Stacked and centred on mobile. */}
          <div className="flex! flex-col! sm:flex-row! items-center! justify-center! sm:justify-between! gap-3! sm:gap-8! border-t! border-white/12! pt-[20px]!">
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
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[14px]! h-[14px]!">
                        <path d={social.path} />
                      </svg>
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
