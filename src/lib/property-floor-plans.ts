import type { SeoProperty } from "./api/property-by-slug";
import { getFloorPlanLabel } from "./property-sections";

export type PropertyFloorPlan = {
  key: string;
  title: string;
  src: string;
  altText?: string;
  titleText?: string;
  caption?: string;
  isPdf: boolean;
};

/** Uploaded documents first, followed by legacy drawings, retaining floor names. */
export function getPropertyFloorPlans(
  property: SeoProperty,
): PropertyFloorPlan[] {
  const sources = [
    ...(property.floorPlanFiles ?? []),
    ...(property.details?.floorPlanImages ?? []),
    ...(property.units ?? [])
      .filter((unit) => unit.floorPlanImageUrl)
      .map((unit) => ({
        title: unit.title,
        imageUrl: unit.floorPlanImageUrl!,
        imageKey: unit.floorPlanImageKey,
        titleText: (unit as { floorPlanTitleText?: string }).floorPlanTitleText,
        caption: (unit as { floorPlanCaption?: string }).floorPlanCaption,
        altText: (unit as typeof unit & { floorPlanAltText?: string })
          .floorPlanAltText,
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
      title:
        plan.title?.trim() ||
        `${getFloorPlanLabel(property.propertyType)} ${plans.length + 1}`,
      src,
      altText: (plan as typeof plan & { altText?: string }).altText,
      titleText: (plan as { titleText?: string }).titleText,
      caption: (plan as { caption?: string }).caption,
      isPdf: /\.pdf(?:$|[?#])/i.test(plan.imageKey || src),
    });
  }
  return plans;
}
