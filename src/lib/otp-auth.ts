import { API_BASE_URL } from './api';

export type OtpMode = 'login' | 'register';

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw Object.assign(new Error(Array.isArray(message) ? message[0] : message), { status: res.status, data });
  }
  return (data as { data?: T }).data ?? (data as T);
};

export const requestRegisterOtp = (body: { name: string; email: string; countryCode: string; phone: string }) =>
  post<{ otpSent: boolean; expiresInSeconds: number }>('/auth/otp/register-request', body);

export const requestLoginOtp = (body: { countryCode: string; phone: string }) =>
  post<{ otpSent: boolean; expiresInSeconds: number }>('/auth/otp/login-request', body);

export const verifyRegisterOtp = (body: { countryCode: string; phone: string; otp: string; name: string; email: string }) =>
  post<{ accessToken: string; user: { id: number; name: string; email: string; phone: string; role: string } }>('/auth/otp/register-verify', body);

export const verifyLoginOtp = (body: { countryCode: string; phone: string; otp: string }) =>
  post<{ accessToken: string; user: { id: number; name: string; email: string; phone: string; role: string } }>('/auth/otp/login-verify', body);
