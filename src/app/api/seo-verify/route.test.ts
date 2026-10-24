import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
afterEach(() => vi.unstubAllGlobals());
describe('authenticated public page verification', () => {
  it('requires a current SEO session', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    expect((await GET(new NextRequest('http://localhost/api/seo-verify?path=/projects'))).status).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects private and external paths before fetching a page', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    expect((await GET(new NextRequest('http://localhost/api/seo-verify?path=//evil.test'))).status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('reports actual response tags and does not follow redirects', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce(new Response('<title>Projects</title><meta content="index, follow" name="robots"><link href="https://www.majestanrealty.com/projects" rel="canonical">'));
    vi.stubGlobal('fetch', fetch);
    const response = await GET(new NextRequest('http://localhost/api/seo-verify?path=/projects'));
    expect(await response.json()).toMatchObject({ status: 200, title: 'Projects', robots: 'index, follow', canonical: 'https://www.majestanrealty.com/projects' });
    expect(fetch.mock.calls[1][1]).toMatchObject({ redirect: 'manual' });
  });
});
