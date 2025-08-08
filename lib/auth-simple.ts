import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    // Return user data from token
    return {
      id: decoded.userId,
      name: decoded.username,
      fullname: 'Test User',
      email: decoded.email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${decoded.username}`,
      isPro: false,
      type: 'user',
      canPay: true,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}