import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const AUTH_COOKIE_NAME = 'ezia-auth-token';

export const getAuthCookieOptions = (): Partial<ResponseCookie> => ({
  httpOnly: false, // Permettre l'accès depuis JavaScript pour l'interceptor axios
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: '/',
});

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';