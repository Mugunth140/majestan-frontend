import { describe, expect, it } from 'vitest';
import { normalizeIndianPhone } from './validate-phone';

describe('normalizeIndianPhone', () => {
  it('strips spaces from a 10-digit mobile', () => {
    expect(normalizeIndianPhone('98765 43210')).toBe('9876543210');
  });

  it('strips +91 prefix', () => {
    expect(normalizeIndianPhone('+91 9876543210')).toBe('9876543210');
  });

  it('rejects invalid numbers', () => {
    expect(normalizeIndianPhone('12345')).toBeNull();
    expect(normalizeIndianPhone('5876543210')).toBeNull();
  });
});
