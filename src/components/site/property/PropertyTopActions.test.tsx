// site/majestan-frontend/src/components/site/property/PropertyTopActions.test.tsx
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyTopActions } from "./PropertyTopActions";
import type { SeoProperty } from "@/lib/api/property-by-slug";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "",
}));

// WishlistButton nests UserAuthModal, which imports the OTP client.
vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: vi.fn(),
  requestRegisterOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  verifyRegisterOtp: vi.fn(),
}));

const writeText = vi.fn().mockResolvedValue(undefined);

const property = {
  id: 18,
  propertyType: "apartment",
  status: "Available",
  city: "Coimbatore",
  title: "Navaneetha RR Raghavendra",
  canonicalSlug: "navaneetha-rr-raghavendra-ap018",
  seo: null,
} as unknown as SeoProperty;

describe("PropertyTopActions", () => {
  it("links back to the listings page and offers Share and Save", () => {
    render(<PropertyTopActions property={property} />);

    const back = screen.getByRole("link", { name: "Back to listings" });
    expect(back.getAttribute("href")).toBe("/for-sale/apartments/coimbatore");
    expect(screen.getByRole("button", { name: "Share" })).toBeDefined();
    expect(screen.getByRole("button", { name: /save/i })).toBeDefined();
  });

  it("copies the canonical URL when Share is clicked", async () => {
    Object.defineProperty(window.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    // jsdom has no navigator.share, so the button takes the clipboard path.
    expect((window.navigator as any).share).toBeUndefined();
    render(<PropertyTopActions property={property} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Share" }));
    });

    expect(writeText).toHaveBeenCalledWith(
      "http://localhost:3000/navaneetha-rr-raghavendra-ap018",
    );
    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();
  });
});
