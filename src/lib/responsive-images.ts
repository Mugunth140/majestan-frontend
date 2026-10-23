import { getImageProps } from "next/image";

/** Keep unknown/external hosts working; optimize only explicitly allowed sources. */
export function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return !/\.svg(?:\?|$)/i.test(src);
  try {
    const url = new URL(src);
    return url.protocol === "https:" && ["cdn.majestanrealty.com", "prismarkcrm.in", "images.unsplash.com"].includes(url.hostname);
  } catch { return false; }
}

export function responsiveImage(src: string, sizes: string) {
  return getImageProps({ src, alt: "", width: 1600, height: 1000, sizes, unoptimized: !canOptimizeImage(src) }).props;
}
