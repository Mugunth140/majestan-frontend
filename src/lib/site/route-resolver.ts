import { type LegacyViewName, VIEW_COMPONENTS } from "@/lib/site/page-registry";

type RoutePattern = {
  pattern: RegExp;
  view: LegacyViewName;
};

const AVAILABLE_VIEWS = new Set<LegacyViewName>(
  Object.keys(VIEW_COMPONENTS) as LegacyViewName[],
);

const STATIC_ROUTE_MAP: Record<string, LegacyViewName> = {
  "/": "index.php",
  "/about": "about.php",
  "/about-us": "about.php",
  "/blogs": "blogs.php",
  "/contact": "contact.php",
  "/contact-us": "contact.php",
  "/projects": "projects.php",
  "/privacy-policy": "privacy_policy.php",
  "/privacy_policy": "privacy_policy.php",
  "/wishlist": "wishlist.php",
  "/buy-rent": "buy_rent.php",
  "/rent": "rent.php",
  "/property": "property.php",
  "/rent-or-sell-your-property": "rent_sell_property.php",
  "/testimonials": "testimonials.php",
  "/services/property-management": "property_management.php",
  "/services/liaisoning": "liaisoning.php",
  "/services/professional-brokerage-service": "professional_brokerage_service.php",
  "/services/professional-brokerage-services": "professional_brokerage_service.php",
  "/services/financial-assistance": "financial_assistance.php",
  "/services/nri": "nri.php",
  "/services/nri-property-investment": "nri.php",
  "/services/luxury": "laxury.php",
};

const PROPERTY_ROUTE_MAP: Record<string, LegacyViewName> = {
  apartment: "apartment.php",
  villa: "villa.php",
  "independent-house": "independent_house.php",
  "independent-housees": "independent_house.php",
  plots: "plots.php",
  plot: "plots.php",
  farmland: "farmland.php",
  farmlands: "farmland.php",
  commercial: "commercial.php",
  industrial: "industrial.php",
  coworking: "coworkers.php",
  coworkers: "coworkers.php",
};

const SEO_ROUTE_PATTERNS: RoutePattern[] = [
  { pattern: /^\/buy-apartments-/i, view: "apartment.php" },
  { pattern: /^\/rent-apartments-/i, view: "apartment.php" },
  { pattern: /^\/flats-sale-/i, view: "apartment.php" },
  { pattern: /^\/flats-rent-/i, view: "apartment.php" },
  { pattern: /^\/buy-villas-/i, view: "villa.php" },
  { pattern: /^\/rent-villas-/i, view: "villa.php" },
  { pattern: /^\/villas-sale-/i, view: "villa.php" },
  { pattern: /^\/villas-rent-/i, view: "villa.php" },
  { pattern: /^\/buy-independent-houses-/i, view: "independent_house.php" },
  { pattern: /^\/rent-independent-houses-/i, view: "independent_house.php" },
  { pattern: /^\/buy-plots-/i, view: "plots.php" },
  { pattern: /^\/plots-sale-/i, view: "plots.php" },
  { pattern: /^\/buy-farmlands-/i, view: "farmland.php" },
  { pattern: /^\/buy-commercial-space-/i, view: "commercial.php" },
  { pattern: /^\/rent-commercial-space-/i, view: "commercial.php" },
  { pattern: /^\/commercialspace-sale-/i, view: "commercial.php" },
  { pattern: /^\/commercialspace-rent-/i, view: "commercial.php" },
  { pattern: /^\/buy-industrials-/i, view: "industrial.php" },
  { pattern: /^\/rent-industrials-/i, view: "industrial.php" },
  { pattern: /^\/industrialspace-rent-/i, view: "industrial.php" },
  { pattern: /^\/rent-co-working-/i, view: "coworkers.php" },
  { pattern: /-a\d+$/i, view: "apartment-details.php" },
  { pattern: /-v\d+$/i, view: "villa-details.php" },
  { pattern: /-p\d+$/i, view: "plot-details.php" },
  { pattern: /-f\d+$/i, view: "farmland-details.php" },
  { pattern: /-c\d+$/i, view: "commercial-details.php" },
  { pattern: /-i\d+$/i, view: "industrial-details.php" },
];

const hasView = (viewName: string): viewName is LegacyViewName =>
  AVAILABLE_VIEWS.has(viewName as LegacyViewName);

const normalisePathname = (pathname: string): string => {
  if (pathname === "/") {
    return "/";
  }

  const cleaned = pathname.replace(/\/+/g, "/").replace(/\/$/, "");
  return cleaned.length > 0 ? cleaned : "/";
};

const pathToViewCandidates = (pathname: string): string[] => {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (trimmed.length === 0) {
    return ["index.php"];
  }

  const segmentOnly = trimmed.split("/").at(-1) ?? trimmed;

  return [
    `${segmentOnly}.php`,
    `${segmentOnly.replace(/-/g, "_")}.php`,
    `${segmentOnly.replace(/_/g, "-")}.php`,
  ];
};

export const resolveViewForPath = (pathname: string): LegacyViewName | null => {
  const lookupKey = normalisePathname(pathname).toLowerCase();

  const staticMapped = STATIC_ROUTE_MAP[lookupKey];
  if (staticMapped && hasView(staticMapped)) {
    return staticMapped;
  }

  const segments = lookupKey.split("/").filter(Boolean);

  if (segments.length >= 2 && segments[0] === "property") {
    const propertyView = PROPERTY_ROUTE_MAP[segments[1]];
    if (propertyView && hasView(propertyView)) {
      return propertyView;
    }
  }

  if (segments.length >= 2 && segments[0] === "blogs" && hasView("blog_details.php")) {
    return "blog_details.php";
  }

  for (const matcher of SEO_ROUTE_PATTERNS) {
    if (matcher.pattern.test(lookupKey) && hasView(matcher.view)) {
      return matcher.view;
    }
  }

  for (const candidate of pathToViewCandidates(lookupKey)) {
    if (hasView(candidate)) {
      return candidate;
    }
  }

  return null;
};
