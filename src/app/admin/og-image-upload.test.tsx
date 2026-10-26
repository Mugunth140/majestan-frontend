import { Theme } from "@radix-ui/themes";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OgImageUpload } from "./og-image-upload";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function setup(value = "") {
  const onChange = vi.fn(), onUploadingChange = vi.fn();
  render(<Theme><OgImageUpload value={value} onChange={onChange} onUploadingChange={onUploadingChange} /></Theme>);
  return { onChange, onUploadingChange };
}
describe('OpenGraph image upload', () => {
  it('uploads image bytes and returns the R2 image URL', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { url: 'https://cdn.example/og.png' } }) });
    vi.stubGlobal('fetch', fetch);
    const { onChange, onUploadingChange } = setup();
    const file = new File(['image-bytes'], 'og.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('OpenGraph image'), file);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://cdn.example/og.png'));
    expect(fetch).toHaveBeenCalledWith('/api/seo-admin/media/opengraph', expect.objectContaining({ body: file, headers: { 'Content-Type': 'image/png' } }));
    expect(onUploadingChange.mock.calls).toEqual([[true], [false]]);
  });
  it('preserves the existing image when an upload fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'R2 unavailable' }) }));
    const { onChange } = setup('https://cdn.example/existing.png');
    await userEvent.upload(screen.getByLabelText('OpenGraph image'), new File(['x'], 'og.png', { type: 'image/png' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('R2 unavailable');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByAltText('OpenGraph image preview')).toHaveAttribute('src', 'https://cdn.example/existing.png');
  });
  it('rejects oversized images before uploading', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    setup();
    await userEvent.upload(screen.getByLabelText('OpenGraph image'), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'og.png', { type: 'image/png' }));
    expect(screen.getByRole('alert')).toHaveTextContent('5 MB');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('clears the override through the remove action', async () => {
    const { onChange } = setup('https://cdn.example/existing.png');
    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
