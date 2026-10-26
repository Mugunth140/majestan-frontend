import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
vi.mock("@/lib/seo-api-base", () => ({ SEO_API_BASE: "https://backend.example/api/v1" }));
afterEach(() => vi.unstubAllGlobals());
function request(body: Uint8Array, origin = 'http://localhost:3000', type = 'image/png') {
  return new NextRequest('http://localhost:3000/api/seo-admin/media/opengraph', {
    method: 'POST', headers: { host: 'localhost:3000', origin, 'content-type': type, cookie: 'majestan_seo_session=token' }, body: Buffer.from(body),
  });
}
describe('OpenGraph binary proxy', () => {
  it('preserves binary bytes, content type and the authenticated session', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"url":"https://cdn.example/og.png"}'));
    vi.stubGlobal('fetch', fetch);
    const bytes = new Uint8Array([137, 80, 0, 255, 254]);
    const response = await POST(request(bytes));
    expect(response.status).toBe(200);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://backend.example/api/v1/seo-admin/media/opengraph');
    expect(init.headers).toEqual({ 'Content-Type': 'image/png', Cookie: 'majestan_seo_session=token' });
    expect(Array.from(init.body)).toEqual(Array.from(bytes));
  });
  it('rejects cross-origin uploads', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect((await POST(request(new Uint8Array([1]), 'https://other.example'))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects oversized bodies without relying on content-length', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect((await POST(request(new Uint8Array(5 * 1024 * 1024 + 1)))).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('returns upstream authorization errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"message":"Sign in"}', { status: 401 })));
    expect((await POST(request(new Uint8Array([1])))).status).toBe(401);
  });
});
