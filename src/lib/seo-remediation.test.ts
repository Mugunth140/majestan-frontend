import { afterEach, describe, expect, it, vi } from 'vitest';
import { listingMetadata, listingPageNumber, childRedirect } from './seo-pagination';
import { buildRealEstateSchema, realEstateType } from './schema-builder';
import { sanitizePublicAreas } from './seo-quality';
import { proxy } from '@/proxy';
import { NextRequest } from 'next/server';

afterEach(() => vi.unstubAllGlobals());
describe('audited public SEO regressions', () => {
  it('gives later listing pages their own preferred URL', () => {
    const seo = { path: '/apartments-for-sale-in-kalapatti-coimbatore', meta_title: 'Kalapatti flats', canonical_type: 'self' };
    expect(listingMetadata(seo, 2).alternates?.canonical).toBe('https://www.majestanrealty.com/apartments-for-sale-in-kalapatti-coimbatore?page=2');
    expect(listingMetadata(seo, 1).alternates?.canonical).toBe('https://www.majestanrealty.com/apartments-for-sale-in-kalapatti-coimbatore');
    expect(listingPageNumber('Infinity')).toBe(1);
    expect(listingPageNumber('-1')).toBe(1);
  });
  it('preserves a renamed section but leaves an off-market fallback alone', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ path: '/renamed-pa0008', scope: 'project' })));
    vi.stubGlobal('fetch', fetch);
    expect(await childRedirect('/renamed-pa0008', 'floor-plans')).toBe('/renamed-pa0008/floor-plans');
    fetch.mockResolvedValue(new Response(JSON.stringify({ path: '/apartments-for-sale-in-coimbatore', scope: 'listing' })));
    expect(await childRedirect('/apartments-for-sale-in-coimbatore', 'floor-plans')).toBe('/apartments-for-sale-in-coimbatore');
  });
  it.each(['seo-route', 'seo-section'])('redirects external requests to %s', async route => {
    const res = await proxy(new NextRequest(`https://example.com/${route}/purnaya-pa0006/photos`));
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://example.com/purnaya-pa0006/photos');
  });
  it('uses real geography and suppresses unknown coordinates and implausible residential areas', () => {
    const graph = buildRealEstateSchema({ title: 'House', canonicalSlug: 'house', propertyType: 'villa', city: 'Coimbatore', state: 'Tamil Nadu', latitude: 0, longitude: 0, details: { areaSqft: '2' } })['@graph'];
    const house = graph.find(n => n['@type'] === 'SingleFamilyResidence');
    expect(house?.address.addressRegion).toBe('Tamil Nadu');
    expect(house).not.toHaveProperty('geo');
    expect(house).not.toHaveProperty('floorSize');
    expect(realEstateType('commercial')).toBe('Place');
    expect(realEstateType('plot', true)).toBe('Landform');
  });
  it('also sanitizes lazy relation payloads and legacy search-card fields', () => {
    const result = sanitizePublicAreas({ propertyType: 'apartment', __propertyDetails__: { areaSqft: '2' }, sq_ft: '2' });
    expect(result.__propertyDetails__.areaSqft).toBeNull();
    expect(result.sq_ft).toBeNull();
  });
  it('keeps reliable measurements without editing the original record', () => {
    const input = { propertyType: 'apartment', details: { areaSqft: '1', builtUpArea: '1200', bedrooms: 3 } };
    const result = sanitizePublicAreas(input);
    expect(result.details.areaSqft).toBeNull();
    expect(result.details.builtUpArea).toBe('1200');
    expect(input.details.areaSqft).toBe('1');
  });
});
