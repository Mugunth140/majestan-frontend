import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
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

      await user.click(screen.getByRole("tab", { name: "Indexing & social" }));

      const socialPanel = screen
        .getByRole("heading", { name: "Social sharing" })
        .closest("section");
      expect(within(socialPanel!).getAllByRole("combobox")[0]).toHaveValue("");
      expect(screen.getByAltText("Social preview thumbnail")).toHaveAttribute(
        "src",
        automaticImage,
      );
    },
  );

  it("previews a custom image override, then saves an empty override when reset to automatic", async () => {
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
      .getByRole("heading", { name: "Main page search appearance" })
      .closest("section");
    const metaTitle = mainPanel!.querySelector('input[maxlength="60"]')!;
    const metaDescription = mainPanel!.querySelector(
      'textarea[maxlength="160"]',
    )!;
    await user.clear(metaTitle);
    await user.type(metaTitle, "Updated project title");
    await user.clear(metaDescription);
    await user.type(metaDescription, "Updated project description");
    await user.click(screen.getByRole("tab", { name: "Indexing & social" }));

    const socialPanel = screen
      .getByRole("heading", { name: "Social sharing" })
      .closest("section");
    const imageSelect = within(socialPanel!).getAllByRole("combobox")[0];
    await user.selectOptions(imageSelect, propertyImage);
    expect(screen.getByAltText("Social preview thumbnail")).toHaveAttribute(
      "src",
      propertyImage,
    );

    await user.selectOptions(imageSelect, "");
    expect(imageSelect).toHaveValue("");
    expect(screen.getByAltText("Social preview thumbnail")).toHaveAttribute(
      "src",
      automaticImage,
    );

    await user.click(screen.getByRole("button", { name: "Save SEO changes" }));

    expect(seoApi).toHaveBeenCalledWith(
      "configs/project%3Aseo-test",
      expect.objectContaining({
        og_image_url: "",
        meta_title: "Updated project title",
        meta_description: "Updated project description",
      }),
      "PUT",
    );
    expect(onSaved).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
