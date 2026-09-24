import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getAdsBanners, resolveAdHref } from './ads';
import { fetchApi } from './api';

vi.mock('./api', () => ({ fetchApi: vi.fn() }));

beforeEach(() => vi.mocked(fetchApi).mockReset());

describe('getAdsBanners', () => {
  it('queries the placement endpoint and returns items', async () => {
    vi.mocked(fetchApi).mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'Diwali',
          desktopImage: 'https://cdn.example/a.webp',
          mobileImage: 'https://cdn.example/am.webp',
          linkType: 'preset',
          linkPreset: 'buy-apartments',
          linkCustom: null,
        },
      ],
      total: 1,
    } as any);
    const out = await getAdsBanners('hero');
    expect(fetchApi).toHaveBeenCalledWith('/ads?placement=hero');
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe(1);
  });

  it('returns [] when the payload is empty', async () => {
    vi.mocked(fetchApi).mockResolvedValue({ items: [], total: 0 } as any);
    await expect(getAdsBanners('hero')).resolves.toEqual([]);
  });
});

describe('resolveAdHref', () => {
  const base = {
    id: 1,
    title: 'X',
    desktopImage: 'd',
    mobileImage: 'm',
    linkType: 'preset' as const,
    linkPreset: 'buy-apartments',
    linkCustom: null,
  };

  it('resolves presets with the city slug', () => {
    expect(resolveAdHref(base, 'coimbatore')).toBe('/for-sale/apartments/coimbatore');
  });

  it('prefers a valid custom path', () => {
    expect(
      resolveAdHref({ ...base, linkType: 'custom', linkCustom: '/rent' }, 'coimbatore'),
    ).toBe('/rent');
  });

  it('falls back to homepage for unknown presets', () => {
    expect(resolveAdHref({ ...base, linkPreset: 'nope' }, 'coimbatore')).toBe('/');
  });
});
