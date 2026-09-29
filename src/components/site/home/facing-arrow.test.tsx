// site/majestan-frontend/src/components/site/home/facing-arrow.test.tsx
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { normalizeFacing, FacingArrow } from './facing-arrow';

// This Vitest setup has no global cleanup, so renders would otherwise pile up
// in document.body and make queries ambiguous.
afterEach(cleanup);

describe('normalizeFacing', () => {
  it('maps 8 compass directions to exact degrees', () => {
    expect(normalizeFacing('north')).toEqual({ degrees: 0, label: 'North', abbr: 'N' });
    expect(normalizeFacing('north_east')).toEqual({ degrees: 45, label: 'North-East', abbr: 'NE' });
    expect(normalizeFacing('east')).toEqual({ degrees: 90, label: 'East', abbr: 'E' });
    expect(normalizeFacing('south_east')).toEqual({ degrees: 135, label: 'South-East', abbr: 'SE' });
    expect(normalizeFacing('south')).toEqual({ degrees: 180, label: 'South', abbr: 'S' });
    expect(normalizeFacing('south_west')).toEqual({ degrees: 225, label: 'South-West', abbr: 'SW' });
    expect(normalizeFacing('west')).toEqual({ degrees: 270, label: 'West', abbr: 'W' });
    expect(normalizeFacing('north_west')).toEqual({ degrees: 315, label: 'North-West', abbr: 'NW' });
  });

  it('accepts variant spellings identically', () => {
    expect(normalizeFacing('North-East')).toEqual({ degrees: 45, label: 'North-East', abbr: 'NE' });
    expect(normalizeFacing('NE')).toEqual({ degrees: 45, label: 'North-East', abbr: 'NE' });
    expect(normalizeFacing('  south west  ')).toEqual({ degrees: 225, label: 'South-West', abbr: 'SW' });
    expect(normalizeFacing('South East')).toEqual({ degrees: 135, label: 'South-East', abbr: 'SE' });
  });

  it('returns null for missing or unknown values', () => {
    expect(normalizeFacing(null)).toBeNull();
    expect(normalizeFacing(undefined)).toBeNull();
    expect(normalizeFacing('')).toBeNull();
    expect(normalizeFacing('upwards')).toBeNull();
  });
});

describe('FacingArrow', () => {
  it('renders a rotated arrow followed by the abbreviation', () => {
    const { container } = render(<FacingArrow facing="north_east" />);
    const indicator = screen.getByTestId('facing-indicator');
    expect(indicator.getAttribute('aria-label')).toBe('North-East facing');
    expect(indicator.textContent).toBe('NE');
    const needle = container.querySelector('svg');
    expect(needle?.getAttribute('style')).toContain('rotate(45deg)');
  });

  it('renders a muted arrow with no label when facing is missing', () => {
    const { container } = render(<FacingArrow facing={null} />);
    expect(screen.getByTestId('facing-indicator').getAttribute('aria-label')).toBe('Facing not specified');
    expect(screen.getByTestId('facing-indicator').textContent).toBe('');
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
