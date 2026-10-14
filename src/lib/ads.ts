import { fetchApi } from './api';

export type AdPlacement = 'hero' | 'offers' | 'mega_menu' | 'listing_feed';

export type AdHeroBanner = {
  id: number;
  title: string;
  desktopImage: string;
  /** Always set — the API falls back to the desktop image when no mobile creative exists. */
  mobileImage: string;
  /** Targeted audience (buy / rent / services / projects); null = all / fallback. */
  audience?: string | null;
  linkType: 'preset' | 'custom';
  linkPreset: string | null;
  linkCustom: string | null;
};

// Keys must match ADS_LINK_PRESETS in the CRM. Site owns templates.
export const ADS_LINK_TEMPLATES: Record<string, string> = {
  'buy-apartments': '/for-sale/apartments/{city}',
  'buy-villas': '/for-sale/villas/{city}',
  'buy-independent-houses': '/for-sale/independent-houses/{city}',
  'buy-plots': '/for-sale/plots/{city}',
  'buy-farmlands': '/for-sale/farmlands/{city}',
  'buy-commercial': '/for-sale/commercial-spaces/{city}',
  'buy-industrial': '/for-sale/industrial-spaces/{city}',
  rent: '/for-rent/{city}',
  'rent-apartments': '/for-rent/apartments/{city}',
  'rent-villas': '/for-rent/villas/{city}',
  'rent-independent-houses': '/for-rent/independent-houses/{city}',
  'rent-commercial': '/for-rent/commercial-spaces/{city}',
  'rent-industrial': '/for-rent/industrial-spaces/{city}',
  'rent-coworking': '/for-rent/coworking/{city}',
  projects: '/projects',
  'services-property-management': '/services/property-management',
  'services-liaisoning': '/services/liaisoning',
  'services-brokerage': '/services/professional-brokerage-services',
  'services-financial': '/services/financial-assistance',
  'services-nri': '/services/nri-property-investment',
  'post-property': '/post-property',
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

/**
 * Ads targeted at `audience`, or — when none are — the untargeted fallback
 * ads. Keeps the API's sort order.
 */
export function adsForAudience(ads: AdHeroBanner[], audience: string): AdHeroBanner[] {
  const targeted = ads.filter((a) => a.audience === audience);
  return targeted.length > 0 ? targeted : ads.filter((a) => !a.audience);
}

export async function getAdsBanners(placement: AdPlacement = 'hero'): Promise<AdHeroBanner[]> {
  const res = await fetchApi<{ items: AdHeroBanner[]; total: number }>(
    `/ads?placement=${encodeURIComponent(placement)}`,
  );
  return Array.isArray(res?.items) ? res.items : [];
}

// Client components (header, listing feed) share one request per placement
// per page load instead of re-fetching on every mount.
const clientCache = new Map<AdPlacement, Promise<AdHeroBanner[]>>();

export function getAdsBannersCached(placement: AdPlacement): Promise<AdHeroBanner[]> {
  let pending = clientCache.get(placement);
  if (!pending) {
    pending = getAdsBanners(placement).catch(() => {
      clientCache.delete(placement); // let a later mount retry
      return [];
    });
    clientCache.set(placement, pending);
  }
  return pending;
}
