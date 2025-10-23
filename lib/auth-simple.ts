import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    // Fetch real user data from MongoDB
    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return null;
    }

    const displayName = user.fullName || user.username;
    const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6D3FC8&color=fff&bold=true&size=128`;

    // Return real user data from MongoDB
    return {
      id: user._id.toString(),
      name: user.username,
      fullname: displayName,
      email: user.email,
      avatarUrl,
      isPro: user.role === 'pro' || user.role === 'beta',
      type: user.role,
      canPay: true,
      subscription: user.subscription,
      betaTester: user.betaTester,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}