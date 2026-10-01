// site/majestan-frontend/src/components/site/locality/LocalityTeaser.test.tsx
import { render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalityTeaser } from "./LocalityTeaser";

afterEach(cleanup);

const overviews = [
  {
    id: 3,
    sublocation: "Saravanampatti",
    cityId: 2,
    city: "Coimbatore",
    state: "Tamil Nadu",
    postalCode: null,
    description:
      "Saravanampatti is one of Coimbatore's fastest-growing corridors with IT parks, schools and hospitals.",
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => overviews,
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LocalityTeaser", () => {
  it("teases with clamped text and a guide link by default", async () => {
    render(
      <LocalityTeaser
        locality="Saravanampatti"
        city="Coimbatore"
        localityHref="/x/locality"
      />,
    );

    expect(await screen.findByText("About Saravanampatti")).toBeDefined();
    expect(screen.getByRole("link", { name: "View locality guide" })).toBeDefined();
  });

  it("renders the full description with no link when used as the page section", async () => {
    const { container } = render(
      <LocalityTeaser locality="Saravanampatti" city="Coimbatore" full />,
    );

    expect(await screen.findByText("About Saravanampatti")).toBeDefined();
    expect(
      screen.queryByRole("link", { name: "View locality guide" }),
    ).toBeNull();
    const body = container.querySelector("p");
    expect(body?.className).not.toMatch("line-clamp-3");
    expect(body?.textContent).toContain("fastest-growing corridors");
  });

  it("renders nothing when the locality has no overview", async () => {
    const { container } = render(
      <LocalityTeaser locality="RS Puram" city="Coimbatore" full />,
    );

    await act(async () => {});
    expect(container.firstChild).toBeNull();
  });
});
