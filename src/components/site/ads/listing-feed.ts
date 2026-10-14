// listing-feed.ts
// Where listing-feed ads sit between cards: one after every AD_EVERY cards,
// rotating through the active ads. Not after the last card — except on a short
// page that would otherwise get none, where one ad closes the list.

export const AD_EVERY = 4;

export type FeedEntry<TItem, TAd> = { kind: "item"; item: TItem } | { kind: "ad"; ad: TAd; slot: number };

export function interleaveAds<TItem, TAd>(items: TItem[], ads: TAd[], every = AD_EVERY): FeedEntry<TItem, TAd>[] {
  const out: FeedEntry<TItem, TAd>[] = [];
  let slot = 0;
  items.forEach((item, i) => {
    out.push({ kind: "item", item });
    const isLast = i === items.length - 1;
    if (ads.length > 0 && (i + 1) % every === 0 && !isLast) {
      out.push({ kind: "ad", ad: ads[slot % ads.length], slot });
      slot++;
    }
  });
  if (slot === 0 && ads.length > 0 && items.length > 0) out.push({ kind: "ad", ad: ads[0], slot: 0 });
  return out;
}
