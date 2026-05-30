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


const SEO_ROUTE_PATTERNS: RoutePattern[] = [
  { pattern: /-ap\d+$/i, view: "apartment-details.php" },
  { pattern: /-v\d+$/i, view: "villa-details.php" },
  { pattern: /-p\d+$/i, view: "plot-details.php" },
  { pattern: /-ip\d+$/i, view: "independent-house-details.php" },
  { pattern: /-fl\d+$/i, view: "farmland-details.php" },
  { pattern: /-cs\d+$/i, view: "commercial-details.php" },
  { pattern: /-in\d+$/i, view: "industrial-details.php" },
  { pattern: /-cw\d+$/i, view: "coworkers-details.php" },
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
