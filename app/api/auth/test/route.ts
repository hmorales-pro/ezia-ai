import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Test if we can find the test user
    const user = await User.findOne({ email: 'test@ezia.ai' }).select('+password');
    
    if (!user) {
      return NextResponse.json({ 
        message: 'Test user not found',
        instruction: 'Run: node scripts/create-test-user.js'
      });
    }

    return NextResponse.json({ 
      message: 'Test user found',
      email: user.email,
      username: user.username,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}