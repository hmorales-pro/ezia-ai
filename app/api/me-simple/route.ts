import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      // Return 200 status with null user to avoid axios error
      return NextResponse.json({ user: null, errCode: 401 }, { status: 200 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    // Connect to MongoDB and fetch real user data
    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ user: null, errCode: 401 }, { status: 200 });
    }

    // Return real user data from MongoDB
    const userData = {
      id: user._id.toString(),
      name: user.username,
      fullname: user.fullName || user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`,
      isPro: user.role === 'pro' || user.role === 'beta',
      subscription: user.subscription || { plan: 'free' },
      type: user.role,
      canPay: true,
      periodEnd: user.subscription?.validUntil || null,
      betaTester: user.betaTester,
    };

    return NextResponse.json({ user: userData, errCode: null }, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    // Return 200 status with null user to avoid axios error
    return NextResponse.json({ user: null, errCode: 401 }, { status: 200 });
  }
}