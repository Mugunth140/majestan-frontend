import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { AdHeroBanner } from '@/lib/ads';
import { ListingFeedBanner } from './listing-feed-banner';

vi.mock('@/contexts/LocationContext', () => ({ useLocationContext: () => ({ location: 'Coimbatore' }) }));

const ad: AdHeroBanner = {
  id: 7, title: 'Explore homes in Coimbatore', desktopImage: 'https://cdn.example/desktop.webp',
  mobileImage: 'https://cdn.example/mobile.webp', audience: 'buy',
  linkType: 'preset', linkPreset: 'buy-apartments', linkCustom: null,
};

function render(banner = ad) {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(createElement(ListingFeedBanner, { ad: banner }));
  return container;
}

describe('website listing advertisement', () => {
  it('uses 3:1 on desktop and 4:5 on mobile while keeping both creatives and their link', () => {
    const container = render();
    const link = container.querySelector('a')!;
    expect(link.classList.contains('aspect-[4/5]')).toBe(true);
    expect(link.classList.contains('md:aspect-[3/1]')).toBe(true);
    expect(link.getAttribute('href')).toBe('/for-sale/apartments/coimbatore');
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute('src')).toBe(ad.desktopImage);
    expect(images[0].classList.contains('md:block!')).toBe(true);
    expect(images[1].getAttribute('src')).toBe(ad.mobileImage);
    expect(images[1].classList.contains('md:hidden!')).toBe(true);
    expect(images[1].getAttribute('alt')).toBe(ad.title);
  });

  it.each([ad.desktopImage, ''])('preserves the desktop ratio when no separate mobile creative is provided', (mobileImage) => {
    const container = render({ ...ad, mobileImage });
    expect(container.querySelector('a')!.classList.contains('aspect-[3/1]')).toBe(true);
    expect(container.querySelector('a')!.classList.contains('aspect-[4/5]')).toBe(false);
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });
});
