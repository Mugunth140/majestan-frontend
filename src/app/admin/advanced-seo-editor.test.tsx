import { Theme } from "@radix-ui/themes";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render as renderBase,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdvancedSeoEditor } from "./advanced-seo-editor";
import { seoApi } from "./seo-admin-shell";

vi.mock("./seo-admin-shell", () => ({ seoApi: vi.fn() }));

const coverImage = "https://cdn.example/project-cover.jpg";
const propertyImage = "https://cdn.example/property-first.jpg";
const automaticImage = "https://cdn.example/default-social.jpg";
const images = [
  { key: "project-cover", kind: "cover", image_url: coverImage },
  {
    key: "property-image:1",
    kind: "photo",
    image_url: propertyImage,
  },
];

function makeInitial(scope: "project" | "property") {
  return {
    config: {
      scope,
      config_key: `${scope}:seo-test`,
      revision: 0,
      settings: {},
    },
    target: { name: `Test ${scope}` },
    images,
    default_og_image_url: automaticImage,
  };
}

describe("AdvancedSeoEditor automatic Open Graph image", () => {
  beforeEach(() => {
    vi.mocked(seoApi).mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses farmland terminology without changing its child route", async () => {
    const user = userEvent.setup();
    const initial = {
      ...makeInitial("property"),
      target: {
        name: "Green Acres",
        property_type: "farmland",
        listing_type: "Rent",
        slug: "green-acres-fl1",
      },
    };
    render(
      <AdvancedSeoEditor
        initial={initial}
        onSaved={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Land area and unit, access/)).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Subpages" }));
    expect(
      screen.getByRole("tab", { name: "Land layout" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Land features" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Canonical URL")).toHaveValue(
      "https://www.majestanrealty.com/green-acres-fl1/floor-plan",
    );
  });

  it.each(["project", "property"] as const)(
    "%s uses the automatic default image in the social preview when no override is saved",
    async (scope) => {
      const user = userEvent.setup();
      render(
        <AdvancedSeoEditor
          initial={makeInitial(scope)}
          onSaved={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Sharing & indexing" }));

      const socialPanel = screen
        .getByRole("heading", { name: "Social sharing" })
        .closest("section");
      if (scope === "property")
        expect(within(socialPanel!).getAllByRole("combobox")[0]).toHaveValue(
          "",
        );
      else
        expect(
          screen.getByLabelText("Project cover image URL"),
        ).toHaveAttribute("readonly");
      expect(screen.getByAltText("Social preview thumbnail")).toHaveAttribute(
        "src",
        scope === "project" ? coverImage : automaticImage,
      );
    },
  );

  it("keeps the project cover read-only and clears an old social override on save", async () => {
    const user = userEvent.setup();
    const initial = makeInitial("project");
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(
      <AdvancedSeoEditor
        initial={initial}
        onSaved={onSaved}
        onClose={onClose}
      />,
    );

    const mainPanel = screen
      .getByRole("heading", { name: "Search appearance" })
      .closest("section");
    const metaTitle = mainPanel!.querySelector('input[maxlength="80"]')!;
    const metaDescription = mainPanel!.querySelector(
      'textarea[maxlength="200"]',
    )!;
    await user.clear(metaTitle);
    await user.type(metaTitle, "Updated project title");
    await user.clear(metaDescription);
    await user.type(metaDescription, "Updated project description");
    await user.click(screen.getByRole("tab", { name: "Sharing & indexing" }));

    const socialPanel = screen
      .getByRole("heading", { name: "Social sharing" })
      .closest("section");
    expect(screen.getByLabelText("Project cover image URL")).toHaveValue(
      coverImage,
    );
    expect(
      within(socialPanel!).queryByRole("combobox"),
    ).not.toBeInTheDocument();
    expect(screen.getByAltText("Social preview thumbnail")).toHaveAttribute(
      "src",
      coverImage,
    );
    await user.click(screen.getByRole("button", { name: "Save SEO changes" }));

    expect(seoApi).toHaveBeenCalledWith(
      "configs/project%3Aseo-test",
      expect.objectContaining({
        og_image_url: null,
        meta_title: "Updated project title",
        meta_description: "Updated project description",
      }),
      "PUT",
    );
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

it("edits section fields without losing untouched sections and saves editorial and lifecycle settings", async () => {
  const user = userEvent.setup();
  vi.mocked(seoApi).mockResolvedValue({});
  const initial = makeInitial("project");
  Object.assign(initial.config, {
    section_seo: { photos: { meta_title: "Existing photos title" } },
  });
  render(
    <AdvancedSeoEditor initial={initial} onSaved={vi.fn()} onClose={vi.fn()} />,
  );
  await user.click(screen.getByRole("tab", { name: "Subpages" }));
  await user.click(screen.getByRole("tab", { name: "Amenities" }));
  const child = screen
    .getByRole("heading", { name: "Amenities page" })
    .closest("section")!;
  await user.type(
    within(child).getByLabelText("Meta title", { exact: false }),
    "Amenities title",
  );
  await user.type(within(child).getByLabelText("H2 subheading"), "Facilities");
  await user.click(
    within(child).getByLabelText("Follow links in this section"),
  );
  await user.click(screen.getByRole("tab", { name: "Content" }));
  await user.type(
    screen.getByLabelText("Overview introduction"),
    "Overview introduction text",
  );
  await user.click(screen.getByRole("tab", { name: "Sharing & indexing" }));
  await user.click(screen.getByLabelText("When this listing expires"));
  await user.click(
    screen.getByRole("option", { name: "410 Gone / Remove from Index" }),
  );
  await user.click(screen.getByRole("button", { name: "Save SEO changes" }));
  expect(vi.mocked(seoApi).mock.calls.at(-1)?.[1]).toMatchObject({
    settings: {
      intro_content: "Overview introduction text",
      expired_redirect_policy: "gone",
    },
    section_seo: {
      photos: { meta_title: "Existing photos title" },
      amenities: {
        meta_title: "Amenities title",
        h2: "Facilities",
        robots_follow: false,
      },
    },
  });
  cleanup();
});

function render(ui: React.ReactNode) {
  return renderBase(<Theme>{ui}</Theme>);
}
