import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { isEmailWhitelisted } from '@/lib/waitlist-storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, fullName } = await req.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'email est whitelisé
    if (!isEmailWhitelisted(email)) {
      return NextResponse.json(
        { 
          error: 'Les inscriptions sont temporairement fermées. Rejoignez notre liste d\'attente !',
          waitlist: true,
          redirectTo: '/waitlist'
        },
        { status: 403 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
      fullName: fullName || username,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      role: 'user',
      subscription: {
        plan: 'free',
      },
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('ezia-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        subscription: user.subscription,
      },
      token,
      message: 'Compte créé avec succès',
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}