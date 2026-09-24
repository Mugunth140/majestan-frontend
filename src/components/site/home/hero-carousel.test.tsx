import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { HeroCarousel } from './hero-carousel';

afterEach(cleanup);

vi.mock('swiper/react', () => ({
  Swiper: ({ children }: any) => <div data-testid="swiper-mock">{children}</div>,
  SwiperSlide: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('swiper/modules', () => ({ Autoplay: {} }));

const banners = [
  {
    id: 1,
    title: 'Diwali',
    desktopImage: 'https://cdn.example/a.webp',
    mobileImage: 'https://cdn.example/am.webp',
    linkType: 'preset',
    linkPreset: 'buy-apartments',
    linkCustom: null,
  },
] as any;

describe('HeroCarousel', () => {
  it('links the slide to the resolved internal path', () => {
    render(<HeroCarousel banners={banners} citySlug="coimbatore" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/for-sale/apartments/coimbatore');
  });

  it('renders desktop and mobile sources', () => {
    render(<HeroCarousel banners={banners} citySlug="coimbatore" />);
    const imgs = screen.getAllByRole('img');
    expect(imgs.map((i) => (i as HTMLImageElement).src)).toEqual([
      'https://cdn.example/a.webp',
      'https://cdn.example/am.webp',
    ]);
  });

  it('renders nothing when empty (caller shows the static fallback)', () => {
    const { container } = render(<HeroCarousel banners={[]} citySlug="coimbatore" />);
    expect(container).toBeEmptyDOMElement();
  });
});
