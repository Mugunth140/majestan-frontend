import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PublicStyles } from "./public-styles";
const route = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.path }));
afterEach(cleanup);
describe("public/admin stylesheet isolation", () => {
  it("keeps Bootstrap and the public theme off admin routes", () => {
    route.path = "/admin/projects/seo";
    render(<PublicStyles />);
    expect(
      document.querySelectorAll('link[href^="/assets/css/"]'),
    ).toHaveLength(0);
  });
  it("loads the bundled legacy stylesheet on public routes", () => {
    route.path = "/projects";
    render(<PublicStyles />);
    const links = document.querySelectorAll('link[href^="/assets/css/"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toMatch(/^\/assets\/css\/legacy\.[0-9a-f]{10}\.css$/);
  });
});
