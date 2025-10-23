import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = "ezia2025admin";

// GET: List all beta testers
export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
    }

    await dbConnect();

    // Find all users with betaTester.isBetaTester = true or role = 'beta'
    const betaTesters = await User.find({
      $or: [
        { 'betaTester.isBetaTester': true },
        { role: 'beta' }
      ]
    }).select('-password').sort({ 'betaTester.invitedAt': -1 });

    return NextResponse.json({
      success: true,
      betaTesters,
      count: betaTesters.length
    });
  } catch (error) {
    console.error('Error fetching beta testers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create new beta tester
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
    }

    const body = await request.json();
    const { email, fullName, notes, hasUnlimitedAccess = true } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Email and full name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate username from email
    const username = email.split('@')[0] + '_beta_' + Date.now();

    // Generate random password (will be sent via email)
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

    // Create new beta tester
    const betaTester = await User.create({
      email: email.toLowerCase(),
      username,
      password: randomPassword, // Will be hashed by pre-save hook
      fullName,
      role: 'beta',
      isEmailVerified: true, // Auto-verify beta testers
      betaTester: {
        isBetaTester: true,
        invitedAt: new Date(),
        invitedBy: 'admin',
        hasUnlimitedAccess,
        notes
      },
      subscription: {
        plan: hasUnlimitedAccess ? 'enterprise' : 'pro',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      usage: {
        imagesGenerated: 0,
        imagesQuota: hasUnlimitedAccess ? 999999 : 1000,
        lastImageReset: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      betaTester: {
        _id: betaTester._id,
        email: betaTester.email,
        fullName: betaTester.fullName,
        password: randomPassword, // Return plain password to send via email
      },
      message: 'Beta tester created successfully'
    });
  } catch (error) {
    console.error('Error creating beta tester:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
