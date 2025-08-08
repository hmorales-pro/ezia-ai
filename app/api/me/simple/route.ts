import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ user: null, errCode: 401 }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    // Return user data from token
    const userData = {
      id: decoded.userId,
      name: decoded.username,
      fullname: 'Test User',
      email: decoded.email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${decoded.username}`,
      isPro: false,
      subscription: { plan: 'free' },
      type: 'user',
      canPay: true,
      periodEnd: null,
    };

    return NextResponse.json({ user: userData, errCode: null }, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ user: null, errCode: 401 }, { status: 401 });
  }
}