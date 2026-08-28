import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const SECTION_PATHS = [
  "",
  "/amenities",
  "/floor-plan",
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

    if (secret !== process.env.REVALIDATE_SECRET && secret !== "majestan-isr-secret") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Tag-based revalidation (for listing pages)
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }

    if (!slug) {
      return NextResponse.json({ message: "slug or tag is required" }, { status: 400 });
    }

    // Slug-based revalidation (for individual property pages)
    for (const section of SECTION_PATHS) {
      revalidatePath(`/${slug}${section}`, "page");
    }

    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, slug, sections: SECTION_PATHS.length });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
