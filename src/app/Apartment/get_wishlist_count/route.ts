import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    success: true,
    cart_count: 0,
    wishlist_count: 0,
  });
}
