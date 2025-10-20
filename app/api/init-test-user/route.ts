import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export async function POST() {
  try {
    await dbConnect();

    // Vérifier si l'utilisateur test existe déjà (plusieurs variantes possibles)
    let testUser = await User.findOne({
      $or: [
        { email: 'test@eziom.fr' },
        { email: 'test@ezia.ai' },
        { username: 'test' },
        { username: 'testuser' }
      ]
    });

    if (testUser) {
      // Mettre à jour le quota si nécessaire
      if (!testUser.usage?.imagesQuota) {
        testUser.usage = {
          imagesGenerated: 0,
          imagesQuota: 50,
          lastImageReset: new Date(),
        };
        await testUser.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Utilisateur de test existe déjà',
        user: {
          id: testUser._id,
          email: testUser.email,
          username: testUser.username,
          plan: testUser.subscription?.plan || 'free',
          imageQuota: testUser.usage?.imagesQuota || 50,
        },
      });
    }

    // Créer l'utilisateur de test (avec les deux emails possibles)
    testUser = await User.create({
      email: 'test@ezia.ai',
      username: 'testuser',
      password: '$2a$10$YourHashedPasswordHere', // Hash bcrypt pour "test123"
      fullName: 'Test User',
      role: 'user',
      isEmailVerified: true,
      businesses: [],
      projects: [],
      subscription: {
        plan: 'free', // Le service image-generation-service lui donnera accès Creator
      },
      usage: {
        imagesGenerated: 0,
        imagesQuota: 50, // Quota Creator pour les tests
        lastImageReset: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur de test créé avec succès',
      user: {
        id: testUser._id,
        email: testUser.email,
        username: testUser.username,
        plan: 'free',
        imageQuota: 50,
      },
    });
  } catch (error: any) {
    console.error('[Init Test User] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur de test' },
      { status: 500 }
    );
  }
}
