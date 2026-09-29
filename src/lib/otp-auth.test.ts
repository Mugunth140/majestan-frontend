import { describe, expect, it } from 'vitest';

describe('otp-auth helpers', () => {
  it('exports four helpers', async () => {
    const mod = await import('./otp-auth');
    for (const fn of ['requestRegisterOtp', 'requestLoginOtp', 'verifyRegisterOtp', 'verifyLoginOtp']) {
      expect(typeof (mod as Record<string, unknown>)[fn]).toBe('function');
    }
  });
});
