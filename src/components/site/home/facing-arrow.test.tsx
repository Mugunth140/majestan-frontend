// site/majestan-frontend/src/components/site/home/facing-arrow.test.tsx
import { describe, expect, it } from 'vitest';
import { normalizeFacing } from './facing-arrow';

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
  });

  it('returns null for missing or unknown values', () => {
    expect(normalizeFacing(null)).toBeNull();
    expect(normalizeFacing(undefined)).toBeNull();
    expect(normalizeFacing('')).toBeNull();
    expect(normalizeFacing('upwards')).toBeNull();
  });
});
