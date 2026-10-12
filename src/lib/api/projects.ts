export type ProjectUnit = {
  id: number;
  unitCode: string;
  title: string | null;
  unitType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  floorNo?: number | null;
  totalFloors?: number | null;
  carpetAreaSqft: string | null;
  builtupAreaSqft: string | null;
  superBuiltupAreaSqft: string | null;
  udsAreaSqft?: string | null;
  plotAreaSqft?: string | null;
  plotAreaCents?: string | number | null;
  parking?: number | null;
  parkingType?: string | null;
  unitGuestParking?: boolean | null;
  poojaRoom?: boolean | null;
  studyRoom?: boolean | null;
  openSides?: number | null;
  boundaryWall?: boolean | null;
  roomDimensions?: { name: string; dimensions: string }[] | null;
  furnishedStatus: string | null;
  facing: string | null;
  furnishingItems?: { furnishingItemId: number; furnishingItem?: { id: number; name: string; icon?: string } | null }[] | null;
  listingMode?: string | null;
  price: string | null;
  monthlyRent?: string | null;
  securityDeposit?: string | null;
  maintenanceFee?: string | null;
  availableFrom?: string | null;
  status: string;
  floorPlanImageUrl: string | null;
  floorPlanImageKey?: string | null;
  isPrimary: boolean;
};

export type ProjectRanges = {
  minPrice: number | null;
  maxPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  minPlotCents: number | null;
  maxPlotCents: number | null;
  plotCents: number[];
  bhk: number[];
  facings: string[];
  unitsCount: number;
  plotDimensions: string[];
  plotBoundaryWall: boolean;
  plotOpenSides: number[];
};

export type ProjectBuilder = {
  id?: number;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  experienceYears?: number | null;
  completedProjects?: number | null;
  ongoingProjects?: number | null;
  description?: string | null;
  website?: string | null;
};

export type ProjectDetail = {
  id: number;
  projectCode: string | null;
  name: string;
  slug: string;
  canonicalSlug: string;
  projectType: string;
  builderName: string | null;
  builder?: ProjectBuilder | null;
  reraNumber: string | null;
  possessionDate: string | null;
  possessionStatus: string;
  city: string;
  state: string | null;
  sublocation: string | null;
  address: string | null;
  pincode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  towers: number | null;
  totalUnits: number | null;
  totalFloors?: number | null;
  projectAreaSqft?: string | number | null;
  towerDetails?: { tower?: string; floors?: number; units?: number }[] | null;
  highlights?: string | null;
  specifications?: { label: string; value: string }[] | null;
  connectivity?: { icon?: string; label?: string; detail?: string }[] | null;
  nearbyCategories?: { title?: string; icon?: string; places?: { name?: string; distance?: string }[] }[] | null;
  projectFaqs?: { id: number; question: string; answer: string; sortOrder?: number }[] | null;
  brochureUrl?: string | null;
  brochureName?: string | null;
  projectAmenities?: { amenityId: number; availability?: string; notes?: string | null; amenity?: { id: number; name: string; icon?: string; category?: string | null } | null }[] | null;
  description: string | null;
  coverImageUrl: string | null;
  mobileCoverImageUrl?: string | null;
  galleryImageUrls: string[] | null;
  videoUrls?: string[] | null;
  status: string;
  ranges: ProjectRanges;
  units: ProjectUnit[];
  seo: {
    seoData?: {
      overview?: {
        title?: string;
        description?: string;
        h1?: string;
        og_title?: string;
        og_description?: string;
        og_image?: string;
        robots?: string;
      };
      faqs?: { question: string; answer: string }[];
    };
  } | null;
};

export type ProjectListItem = Omit<ProjectDetail, "units" | "seo" | "description" | "address" | "towers" | "totalUnits" | "galleryImageUrls">;

export type ProjectListResponse = {
  items: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
};

export type ProjectListParams = {
  city?: string;
  projectType?: string;
  bhk?: number;
  minPrice?: number;
  maxPrice?: number;
  possession?: string;
  rera?: boolean;
  page?: number;
  limit?: number;
};

type ApiEnvelope<T> = { success: boolean; data: T };

const isAbsoluteUrl = (u: string | undefined) => !!u && /^https?:\/\//i.test(u);
const SERVER_API_BASE =
  (isAbsoluteUrl(process.env.API_BASE_URL) && process.env.API_BASE_URL as string) ||
  (isAbsoluteUrl(process.env.NEXT_PUBLIC_API_BASE_URL) && process.env.NEXT_PUBLIC_API_BASE_URL as string) ||
  "http://localhost:5000/api/v1";

// Browsers must go through the same-origin /site-api rewrite (see next.config.ts):
// NEXT_PUBLIC_API_BASE_URL points at localhost, which is unreachable from user devices.
const API_BASE =
  typeof window === "undefined" ? SERVER_API_BASE : "/site-api";

async function fetchProjectApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    next: (init as any)?.next ?? { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Projects API failed: ${res.status}`);
  const payload = (await res.json()) as ApiEnvelope<T> | T;
  if (typeof payload === "object" && payload !== null && "success" in payload && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export function getProjectBySlugUrl(slug: string): Promise<ProjectDetail> {
  return fetchProjectApi<ProjectDetail>(`/projects/by-slug/${encodeURIComponent(slug)}`);
}

export function listProjects(params: ProjectListParams = {}): Promise<ProjectListResponse> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const qs = q.toString();
  return fetchProjectApi<ProjectListResponse>(`/projects${qs ? `?${qs}` : ""}`);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const slugs = await fetchProjectApi<string[]>("/projects/all-slugs", {
      next: { revalidate: 300 } as any,
    });
    return (Array.isArray(slugs) ? slugs : []).filter(Boolean);
  } catch {
    return [];
  }
}

export function toSlug(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** 1 cent of land = 435.6 sq.ft. Single source for cents ↔ sqft display. */
export const CENT_TO_SQFT = 435.6;

export function centsToSqft(cents: number | null | undefined): number | null {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return null;
  return Math.round(cents * CENT_TO_SQFT);
}

export function formatPlotCents(value: number | string | null | undefined): string | null {
  if (value == null || String(value).trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${String(parseFloat(n.toFixed(2)))} cents`;
}

export function formatINR(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Price on Request";
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "Price on Request";
  // Two decimals at most, and only the ones that carry information:
  // ₹40.45 L stays as it is, ₹90.00 L reads ₹90 L, ₹1.20 Cr reads ₹1.2 Cr.
  // Padding every price to two places made round numbers look measured.
  const short = (n: number) => `${parseFloat(n.toFixed(2))}`;
  if (num >= 10000000) return `₹${short(num / 10000000)} Cr`;
  if (num >= 100000) return `₹${short(num / 100000)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * A price range with the unit on both ends and the rupee sign once:
 * "₹1.5 Cr – 2.2 Cr", "₹90 L – 1.2 Cr". Writing the unit each side keeps
 * the upper bound readable on its own, so "1.3 – 1.46" is never mistaken
 * for lakhs. Equal ends, or a single known end, collapse to one price.
 */
export function formatINRRange(
  min: string | number | null | undefined,
  max: string | number | null | undefined,
): string {
  const lo = Number(min);
  const hi = Number(max);
  const hasLo = min != null && min !== "" && Number.isFinite(lo) && lo > 0;
  const hasHi = max != null && max !== "" && Number.isFinite(hi) && hi > 0;
  if (!hasLo && !hasHi) return "Price on request";
  if (!hasLo || !hasHi || lo === hi) return formatINR(hasLo ? lo : hi);
  const [a, b] = lo < hi ? [lo, hi] : [hi, lo];
  return `${formatINR(a)} – ${formatINR(b).replace(/^₹/, "")}`;
}
