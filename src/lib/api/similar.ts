import type { FeaturedProperty } from "@/lib/api";
import type { ProjectListItem } from "@/lib/api/projects";

const isAbsoluteUrl = (u: string | undefined) => !!u && /^https?:\/\//i.test(u);
const API_BASE =
  (isAbsoluteUrl(process.env.API_BASE_URL) && (process.env.API_BASE_URL as string)) ||
  (isAbsoluteUrl(process.env.NEXT_PUBLIC_API_BASE_URL) && (process.env.NEXT_PUBLIC_API_BASE_URL as string)) ||
  "http://localhost:5000/api/v1";

/** Server-side only. Any failure yields an empty rail rather than a broken page. */
async function getList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const payload = (await res.json()) as { data?: T[] } | T[];
    const data = Array.isArray(payload) ? payload : payload?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Each card carries why it matched ("Ready to move", "3 BHK", "In Peelamedu"…), closest first. */
export type SimilarProperty = FeaturedProperty & {
  matches: string[];
  /** Optional: absent in responses cached before these fields existed. */
  builtUpAreaSqft?: number | null;
  plotAreaLabel?: string | null;
  plotDimensions?: string | null;
};
export type SimilarProject = ProjectListItem & { matches: string[] };

/** Responses cached from before match reasons existed have none; default them. */
const withMatches = <T extends { matches?: unknown }>(items: T[]) =>
  items.map((item) => ({ ...item, matches: Array.isArray(item.matches) ? (item.matches as string[]) : [] }));

/** Bump when the response shape changes, so cached old-shape responses are never reused. */
const SHAPE = "v=3";

export const getSimilarProperties = async (id: number): Promise<SimilarProperty[]> =>
  withMatches(await getList<SimilarProperty>(`/similar/properties/${id}?${SHAPE}`));

export const getSimilarProjects = async (id: number): Promise<SimilarProject[]> =>
  withMatches(await getList<SimilarProject>(`/similar/projects/${id}?${SHAPE}`));
