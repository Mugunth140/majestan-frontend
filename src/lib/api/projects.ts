export type ProjectUnit = {
  id: number;
  unitCode: string;
  title: string | null;
  unitType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  carpetAreaSqft: string | null;
  builtupAreaSqft: string | null;
  superBuiltupAreaSqft: string | null;
  furnishedStatus: string | null;
  facing: string | null;
  price: string | null;
  status: string;
  floorPlanImageUrl: string | null;
  isPrimary: boolean;
};

export type ProjectRanges = {
  minPrice: number | null;
  maxPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  bhk: number[];
  unitsCount: number;
};

export type ProjectDetail = {
  id: number;
  projectCode: string | null;
  name: string;
  slug: string;
  canonicalSlug: string;
  projectType: string;
  builderName: string | null;
  reraNumber: string | null;
  possessionDate: string | null;
  possessionStatus: string;
  city: string;
  state: string | null;
  sublocation: string | null;
  address: string | null;
  towers: number | null;
  totalUnits: number | null;
  description: string | null;
  coverImageUrl: string | null;
  galleryImageUrls: string[] | null;
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

const SERVER_API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
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

export function formatINR(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Price on Request";
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "Price on Request";
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}
