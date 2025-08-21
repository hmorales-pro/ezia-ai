import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  const steps: any[] = [];
  
  try {
    steps.push({ step: 1, action: 'Parsing request body' });
    const { email, password } = await req.json();
    steps.push({ step: 2, data: { email, passwordProvided: !!password } });

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email et mot de passe requis',
        steps
      }, { status: 400 });
    }

    steps.push({ step: 3, action: 'Connecting to database' });
    await dbConnect();
    steps.push({ step: 4, action: 'Database connected' });

    steps.push({ step: 5, action: 'Finding user by email' });
    const user = await User.findOne({ email }).select('+password');
    steps.push({ step: 6, userFound: !!user, hasPassword: !!user?.password });
    
    if (!user) {
      return NextResponse.json({
        error: 'Email ou mot de passe incorrect',
        steps
      }, { status: 401 });
    }

    steps.push({ step: 7, action: 'Comparing passwords' });
    
    // Direct bcrypt comparison for debugging
    const isValidPassword = await bcrypt.compare(password, user.password);
    steps.push({ step: 8, passwordValid: isValidPassword });
    
    if (!isValidPassword) {
      return NextResponse.json({
        error: 'Email ou mot de passe incorrect',
        passwordProvided: password,
        steps
      }, { status: 401 });
    }

    steps.push({ step: 9, action: 'Generating JWT token' });
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    steps.push({ step: 10, tokenGenerated: !!token });

    steps.push({ step: 11, action: 'Setting cookie' });
    const cookieStore = await cookies();
    cookieStore.set('ezia-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    steps.push({ step: 12, action: 'Login successful' });
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        subscription: user.subscription,
      },
      token,
      steps
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Erreur de connexion',
      message: error.message,
      stack: error.stack,
      steps
    }, { status: 500 });
  }
}