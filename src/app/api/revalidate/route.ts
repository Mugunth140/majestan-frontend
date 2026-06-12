import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, secret } = body;

    // Basic security check - in production use an env variable
    if (secret !== process.env.REVALIDATE_SECRET && secret !== "majestan-isr-secret") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    // Revalidate the main property page and all its section pages
    revalidatePath(`/${slug}`, "layout");

    return NextResponse.json({ revalidated: true, slug });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
