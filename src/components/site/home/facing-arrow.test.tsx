// site/majestan-frontend/src/components/site/home/facing-arrow.test.tsx
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { normalizeFacing, FacingArrow } from './facing-arrow';

// This Vitest setup has no global cleanup, so renders would otherwise pile up
// in document.body and make queries ambiguous.
afterEach(cleanup);

describe('FacingArrow', () => {
  it('renders a compass dial with the needle rotated to the facing', () => {
    const { container } = render(<FacingArrow facing="north_east" />);
    const compass = screen.getByTestId('facing-compass');
    expect(compass.getAttribute('aria-label')).toBe('North-East facing');
    const needle = container.querySelector('svg');
    expect(needle?.getAttribute('style')).toContain('rotate(45deg)');
  });

  it('renders a muted dial with no needle when facing is missing', () => {
    const { container } = render(<FacingArrow facing={null} />);
    expect(screen.getByTestId('facing-compass').getAttribute('aria-label')).toBe('Facing not specified');
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('normalizeFacing', () => {
  it('maps 8 compass directions to exact degrees', () => {
    expect(normalizeFacing('north')).toEqual({ degrees: 0, label: 'North' });
    expect(normalizeFacing('north_east')).toEqual({ degrees: 45, label: 'North-East' });
    expect(normalizeFacing('east')).toEqual({ degrees: 90, label: 'East' });
    expect(normalizeFacing('south_east')).toEqual({ degrees: 135, label: 'South-East' });
    expect(normalizeFacing('south')).toEqual({ degrees: 180, label: 'South' });
    expect(normalizeFacing('south_west')).toEqual({ degrees: 225, label: 'South-West' });
    expect(normalizeFacing('west')).toEqual({ degrees: 270, label: 'West' });
    expect(normalizeFacing('north_west')).toEqual({ degrees: 315, label: 'North-West' });
  });

  it('accepts variant spellings identically', () => {
    expect(normalizeFacing('North-East')).toEqual({ degrees: 45, label: 'North-East' });
    expect(normalizeFacing('NE')).toEqual({ degrees: 45, label: 'North-East' });
    expect(normalizeFacing('  south west  ')).toEqual({ degrees: 225, label: 'South-West' });
    expect(normalizeFacing("South East")).toEqual({ degrees: 135, label: "South-East" });
  });

  it('returns null for missing or unknown values', () => {
    expect(normalizeFacing(null)).toBeNull();
    expect(normalizeFacing(undefined)).toBeNull();
    expect(normalizeFacing('')).toBeNull();
    expect(normalizeFacing('upwards')).toBeNull();
  });
});
