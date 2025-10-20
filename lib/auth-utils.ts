import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import jwt from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'ezia-auth-token';

export const getAuthCookieOptions = (): Partial<ResponseCookie> => ({
  httpOnly: false, // Permettre l'accès depuis JavaScript pour l'interceptor axios
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: '/',
});

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function verifyToken(token: string | undefined): { userId: string; username: string; email: string } | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}