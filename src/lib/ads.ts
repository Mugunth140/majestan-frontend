import { fetchApi } from './api';

export type AdHeroBanner = {
  id: number;
  title: string;
  desktopImage: string;
  mobileImage: string;
  linkType: 'preset' | 'custom';
  linkPreset: string | null;
  linkCustom: string | null;
};

// Keys must match ADS_LINK_PRESETS values in the CRM (Plan C). Site owns templates.
export const ADS_LINK_TEMPLATES: Record<string, string> = {
  'buy-apartments': '/for-sale/apartments/{city}',
  'buy-villas': '/for-sale/villas/{city}',
  'buy-plots': '/for-sale/plots/{city}',
  'buy-commercial': '/for-sale/commercial-spaces/{city}',
  rent: '/for-rent/{city}',
  projects: '/projects',
  contact: '/contact',
  home: '/',
};

export function resolveAdHref(banner: AdHeroBanner, citySlug: string): string {
  if (banner.linkType === 'custom' && banner.linkCustom?.startsWith('/')) {
    return banner.linkCustom;
  }
  const template = (banner.linkPreset && ADS_LINK_TEMPLATES[banner.linkPreset]) || '/';
  return template.replace('{city}', citySlug);
}

export async function getAdsBanners(placement = 'hero'): Promise<AdHeroBanner[]> {
  const res = await fetchApi<{ items: AdHeroBanner[]; total: number }>(
    `/ads?placement=${encodeURIComponent(placement)}`,
  );
  return Array.isArray(res?.items) ? res.items : [];
}
