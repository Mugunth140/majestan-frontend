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
  it("preserves the original public stylesheets on public routes", () => {
    route.path = "/projects";
    render(<PublicStyles />);
    expect(
      document.querySelectorAll('link[href^="/assets/css/"]'),
    ).toHaveLength(7);
    expect(
      document.querySelector('link[href="/assets/css/styles.css"]'),
    ).not.toBeNull();
  });
});
