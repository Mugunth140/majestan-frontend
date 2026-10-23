import { describe, expect, it } from "vitest";
import { canOptimizeImage, responsiveImage } from "./responsive-images";
describe("responsive images", () => {
  it("supplies size variants for the production image CDN", () => {
    const image = responsiveImage("https://cdn.majestanrealty.com/uploads/cover.webp", "100vw");
    expect(image.srcSet).toContain("w=640");
    expect(image.sizes).toBe("100vw");
  });
  it("preserves unknown hosts and local API images without optimizer failures", () => {
    expect(canOptimizeImage("http://localhost:5000/uploads/cover.jpg")).toBe(false);
    expect(responsiveImage("https://other.example/image.jpg", "100vw").src).toBe("https://other.example/image.jpg");
    expect(canOptimizeImage("//other.example/image.jpg")).toBe(false);
  });
});
