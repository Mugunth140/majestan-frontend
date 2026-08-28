import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, city, listingType, propertyType, locality } = body;

    if (!q && !locality && !propertyType) {
      return NextResponse.json({ hits: [], total: 0 });
    }

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (listingType) params.set("listingType", listingType);
    if (propertyType) params.set("propertyType", propertyType);
    if (locality) params.set("locality", locality);
    params.set("limit", "5");
    params.set("hybrid", "true");

    const res = await fetch(`${API_BASE}/search?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ hits: [], total: 0, fallback: true });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ hits: [], total: 0, error: "Search failed" }, { status: 500 });
  }
}
