import { Theme } from "@radix-ui/themes";
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  cleanup,
  render as renderBase,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeoWorkspace } from "./seo-workspace";
import { seoApi } from "./seo-admin-shell";
vi.mock("./seo-admin-shell", () => ({ seoApi: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
describe("inventory editor API envelope", () => {
  it.each(["project", "property"] as const)(
    "opens the advanced %s editor from nested config.scope",
    async (module) => {
      vi.mocked(seoApi).mockImplementation(async (path) => {
        if (path === "options") return { cities: [], sublocations: [] };
        if (path === `inventory/${module}/7`)
          return {
            config: { scope: module, config_key: `${module}:7`, settings: {} },
            target: {
              name: "Test inventory",
              canonical_slug: "test-inventory",
            },
            images: [
              {
                key:
                  module === "project" ? "project-cover" : "property-image:1",
                kind: "Photo",
                image_url: "https://cdn.example.com/cover.jpg",
              },
            ],
          };
        if (path.startsWith("inventory/")) return { items: [], total: 0 };
        return [];
      });
      render(<SeoWorkspace module={module} initialId="7" />);
      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByRole("tab", { name: "Images" }),
      ).toBeInTheDocument();
      expect(
        within(dialog).queryByRole("tab", { name: "Local entity" }),
      ).not.toBeInTheDocument();
      await userEvent.click(
        within(dialog).getByRole("tab", { name: "Images" }),
      );
      const card = within(dialog)
        .getByLabelText("Caption / image description")
        .closest("article")!;
      const preview = card.querySelector("img")!;
      expect(preview).toHaveAttribute(
        "src",
        "https://cdn.example.com/cover.jpg",
      );
      expect(
        preview.compareDocumentPosition(
          within(card).getByLabelText("Caption / image description"),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );
});

function render(ui: React.ReactNode) {
  return renderBase(<Theme>{ui}</Theme>);
}

describe('core and service page editor', () => {
  const page = {
    id: 42, scope: 'page', config_key: 'page:/services/property-management',
    public_path: '/services/property-management', revision: 3,
    meta_title: 'Property management', meta_description: 'Existing description',
    h1: 'Existing heading', intro_content: 'Existing introduction',
    bottom_content: 'Existing guide', settings: {}, highlights: [], faqs: [],
    robots_index: true, robots_follow: true,
  };
  function api(saveError?: string) {
    vi.mocked(seoApi).mockImplementation(async (path, body) => {
      if (path === 'options') return { cities: [], sublocations: [] };
      if (path === 'configs?scope=page') return [page];
      if (path.startsWith('configs/')) {
        if (saveError) throw new Error(saveError);
        return { ...(body as Record<string, unknown>), revision: 4 };
      }
      return [];
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 200, canonical: 'https://www.majestanrealty.com/services/property-management', robots: 'index, follow',
    }))));
  }
  async function openEditor() {
    render(<SeoWorkspace module="page" />);
    await userEvent.click(await screen.findByRole('button', { name: 'Edit SEO for ' + page.public_path }));
    return within(await screen.findByRole('dialog'));
  }
  it('loads existing content, saves the fixed route with revision and verifies the saved public page', async () => {
    api();
    const dialog = await openEditor();
    expect(dialog.getByText('Page route: ' + page.public_path)).toBeInTheDocument();
    expect(dialog.queryByLabelText('Public URL path')).not.toBeInTheDocument();
    expect(dialog.getByLabelText(/Top introduction/)).toHaveValue(page.intro_content);
    const title = dialog.getByLabelText(/^Meta title/);
    await userEvent.clear(title);
    await userEvent.type(title, 'Updated service title');
    const intro = dialog.getByLabelText(/Top introduction/);
    await userEvent.clear(intro);
    await userEvent.type(intro, 'Updated service introduction');
    await userEvent.click(dialog.getByRole('combobox', { name: 'Canonical type' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Manual Override' }));
    await userEvent.type(dialog.getByLabelText('Custom canonical URL'), 'https://www.majestanrealty.com/services/nri-services');
    await userEvent.click(dialog.getByRole('button', { name: 'Save SEO changes' }));
    await waitFor(() => expect(seoApi).toHaveBeenCalledWith(
      'configs/' + encodeURIComponent(page.config_key),
      expect.objectContaining({ revision: 3, public_path: page.public_path, meta_title: 'Updated service title', intro_content: 'Updated service introduction', canonical_type: 'custom', canonical_url: 'https://www.majestanrealty.com/services/nri-services' }),
      'PUT',
    ));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/seo-verify?path=' + encodeURIComponent(page.public_path), { cache: 'no-store' }));
  });
  it('uploads a core page image before allowing save and persists the returned R2 URL', async () => {
    api();
    let finishUpload!: (response: Response) => void;
    const uploadResponse = new Promise<Response>((resolve) => { finishUpload = resolve; });
    const fetch = vi.fn().mockImplementation((url: string) => url === '/api/seo-admin/media/opengraph'
      ? uploadResponse : Promise.resolve(new Response('{}')));
    vi.stubGlobal('fetch', fetch);
    const dialog = await openEditor();
    expect(dialog.queryByLabelText('OpenGraph image URL')).not.toBeInTheDocument();
    const file = new File(['image-bytes'], 'social.png', { type: 'image/png' });
    await userEvent.upload(dialog.getByLabelText('OpenGraph image'), file);
    expect(dialog.getByRole('button', { name: 'Save SEO changes' })).toBeDisabled();
    finishUpload(new Response(JSON.stringify({ data: { url: 'https://cdn.example/uploads/seo/opengraph/new.png' } })));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Save SEO changes' })).toBeEnabled());
    expect(dialog.getByAltText('OpenGraph image preview')).toHaveAttribute('src', 'https://cdn.example/uploads/seo/opengraph/new.png');
    await userEvent.click(dialog.getByRole('button', { name: 'Save SEO changes' }));
    await waitFor(() => expect(seoApi).toHaveBeenCalledWith(
      'configs/' + encodeURIComponent(page.config_key),
      expect.objectContaining({ og_image_url: 'https://cdn.example/uploads/seo/opengraph/new.png', revision: 3 }),
      'PUT',
    ));
  });
  it('retains unsaved edits and shows a rejected save', async () => {
    api('Someone changed this SEO. Reload before saving');
    const dialog = await openEditor();
    const title = dialog.getByLabelText(/^Meta title/);
    await userEvent.clear(title);
    await userEvent.type(title, 'Keep my edit');
    await userEvent.click(dialog.getByRole('button', { name: 'Save SEO changes' }));
    expect(await dialog.findByRole('alert')).toHaveTextContent('Reload before saving');
    expect(title).toHaveValue('Keep my edit');
    expect(fetch).not.toHaveBeenCalled();
  });
});
