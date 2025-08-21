import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ user: null, errCode: 401 }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    await dbConnect();
    
    // Get fresh user data from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ user: null, errCode: 401 }, { status: 401 });
    }

    // Format user data to match expected structure
    const userData = {
      id: user._id,
      name: user.username,
      fullname: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isPro: user.role === 'pro' || user.role === 'admin',
      subscription: user.subscription,
      // Additional fields for compatibility
      type: 'user',
      canPay: true,
      periodEnd: user.subscription?.validUntil || null,
    };

    return NextResponse.json({ user: userData, errCode: null }, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ user: null, errCode: 401 }, { status: 401 });
  }
}
