import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const SECTION_PATHS = [
  "",           // root slug
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
    const { slug, secret } = body;

    if (secret !== process.env.REVALIDATE_SECRET && secret !== "majestan-isr-secret") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    // Revalidate the root slug and all known section sub-pages
    for (const section of SECTION_PATHS) {
      revalidatePath(`/${slug}${section}`, "page");
    }

    // Also revalidate the global layout to catch dynamic paths like /projects/[city]/[slug]
    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, slug, sections: SECTION_PATHS.length });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
