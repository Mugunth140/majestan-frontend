import type { SeoProperty } from "./api/property-by-slug";
import { getFloorPlanLabel } from "./property-sections";

export type PropertyFloorPlan = {
  key: string;
  title: string;
  src: string;
  isPdf: boolean;
};

/** Uploaded documents first, followed by legacy drawings, retaining floor names. */
export function getPropertyFloorPlans(property: SeoProperty): PropertyFloorPlan[] {
  const sources = [
    ...(property.floorPlanFiles ?? []),
    ...(property.details?.floorPlanImages ?? []),
    ...(property.units ?? []).filter((unit) => unit.floorPlanImageUrl).map((unit) => ({
      title: unit.title, imageUrl: unit.floorPlanImageUrl!, imageKey: unit.floorPlanImageKey,
    })),
  ];
  const keys = new Set<string>();
  const urls = new Set<string>();
  const plans: PropertyFloorPlan[] = [];
  for (const plan of sources) {
    const src = plan.imageUrl;
    const key = plan.imageKey || src;
    if (!src || keys.has(key) || urls.has(src)) continue;
    keys.add(key);
    urls.add(src);
    plans.push({
      key,
      title: plan.title?.trim() || `${getFloorPlanLabel(property.propertyType)} ${plans.length + 1}`,
      src,
      isPdf: /\.pdf(?:$|[?#])/i.test(plan.imageKey || src),
    });
  }
  return plans;
}
