import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { INVENTORY_TAG, SEO_CONTENT_TAG, seoPathTags } from "@/lib/public-cache-tags";

const SECTION_PATHS = [
  "",
  "/amenities",
  "/floor-plan",
  "/floor-plans",
  "/locality",
  "/photos",
  "/price",
  "/specifications",
  "/videos",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, tag, secret } = body;

    // No hardcoded fallback: it let anyone purge the site's cache.
    const expected = process.env.REVALIDATE_SECRET;
    if (!expected || secret !== expected) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Tag-based revalidation (for listing pages)
    if (tag) {
      revalidateTag(tag, { expire: 0 });
      revalidateTag(INVENTORY_TAG, { expire: 0 });
      revalidateTag(SEO_CONTENT_TAG, { expire: 0 });
      revalidateTag("pseo-inventory", { expire: 0 });
      revalidatePath("/");
      return NextResponse.json({ revalidated: true, tag });
    }

    if (!slug) {
      return NextResponse.json({ message: "slug or tag is required" }, { status: 400 });
    }

    // Expire snapshots before the next render, including sold/renamed records.
    revalidateTag(INVENTORY_TAG, { expire: 0 });
    revalidateTag(SEO_CONTENT_TAG, { expire: 0 });
    for (const seoTag of seoPathTags(`/${slug}`)) revalidateTag(seoTag, { expire: 0 });
    revalidatePath(`/detail-render/${slug}`, "page");

    // Slug-based revalidation (for individual property pages)
    for (const section of SECTION_PATHS) {
      revalidatePath(`/${slug}${section}`, "page");
      if (section) revalidatePath(`/detail-section/${slug}${section}`, "page");
    }

    revalidatePath('/');
    revalidateTag('pseo-inventory', { expire: 0 });

    return NextResponse.json({ revalidated: true, slug, sections: SECTION_PATHS.length });
  } catch {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
