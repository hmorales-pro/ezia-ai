import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utilisateur test en mémoire
const testUser = {
  _id: '123456789',
  email: 'test@ezia.ai',
  username: 'testuser',
  password: '$2a$10$YourHashedPasswordHere', // Will be set below
  fullName: 'Test User',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=testuser',
  role: 'user',
  subscription: { plan: 'free' }
};

// Password will be hashed on first use

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Check if it's our test user
    if (email !== testUser.email) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Hash password on first use
    if (!testUser.password || testUser.password === '$2a$10$YourHashedPasswordHere') {
      testUser.password = await bcrypt.hash('test123', 10);
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, testUser.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: testUser._id,
        email: testUser.email,
        username: testUser.username,
        role: testUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: testUser._id,
        email: testUser.email,
        username: testUser.username,
        fullName: testUser.fullName,
        avatarUrl: testUser.avatarUrl,
        role: testUser.role,
        subscription: testUser.subscription,
      },
      token,
      message: 'Connexion réussie (mode simplifié)'
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur de connexion',
        details: error.message
      },
      { status: 500 }
    );
  }
}