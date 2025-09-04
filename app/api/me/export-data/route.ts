import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Business } from '@/models/Business';
import UserProject from '@/models/UserProject';
import UserProjectMultipage from '@/models/UserProjectMultipage';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur non trouvé' }, { status: 401 });
    }

    // Connect to database
    await connect();

    // Fetch all user data
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Remove sensitive data
    const userData = user.toObject();
    delete userData.password;

    // Fetch businesses
    const businesses = await Business.find({ user_id: userId });

    // Fetch projects
    const projects = await UserProject.find({ userId });
    const multipageProjects = await UserProjectMultipage.find({ userId });

    // Prepare data export
    const exportData = {
      exportDate: new Date().toISOString(),
      gdprCompliance: {
        requested: new Date().toISOString(),
        dataController: 'Ezia AI',
        purpose: 'GDPR/RGPD Data Export',
        legalBasis: 'User request under GDPR Article 15 (Right of Access) and Article 20 (Right to Data Portability)'
      },
      user: {
        profile: {
          id: userData._id,
          email: userData.email,
          username: userData.username,
          fullName: userData.fullName,
          avatarUrl: userData.avatarUrl,
          role: userData.role,
          isEmailVerified: userData.isEmailVerified,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          lastLoginAt: userData.lastLoginAt,
          subscription: userData.subscription
        },
        preferences: {
          // Add any user preferences stored
        }
      },
      businesses: businesses.map(business => ({
        id: business._id,
        businessId: business.business_id,
        name: business.name,
        description: business.description,
        industry: business.industry,
        stage: business.stage,
        contact: {
          email: business.email,
          phone: business.phone,
          website: business.website_url,
          existingWebsite: business.existingWebsiteUrl
        },
        socialMedia: business.social_media,
        marketAnalysis: business.market_analysis,
        marketingStrategy: business.marketing_strategy,
        businessModel: business.business_model,
        offerings: business.offerings,
        financialInfo: business.financial_info,
        customerInsights: business.customer_insights,
        resources: business.resources,
        goals: business.goals,
        eziaInteractions: business.ezia_interactions,
        metrics: business.metrics,
        createdAt: business._createdAt,
        updatedAt: business._updatedAt
      })),
      projects: {
        singlePage: projects.map(project => ({
          id: project._id,
          projectId: project.projectId,
          name: project.name,
          description: project.description,
          businessId: project.businessId,
          businessName: project.businessName,
          subdomain: project.subdomain,
          status: project.status,
          metadata: project.metadata,
          analytics: project.analytics,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          // Include code only if requested
          content: {
            html: project.html,
            css: project.css,
            js: project.js,
            prompt: project.prompt
          },
          versions: project.versions
        })),
        multiPage: multipageProjects.map(project => ({
          id: project._id,
          projectId: project.projectId,
          name: project.name,
          description: project.description,
          businessId: project.businessId,
          subdomain: project.subdomain,
          status: project.status,
          pages: project.pages,
          settings: project.settings,
          analytics: project.analytics,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        }))
      },
      dataCategories: {
        personalData: ['email', 'username', 'fullName', 'avatarUrl'],
        businessData: ['business information', 'market analysis', 'marketing strategy', 'financial info'],
        projectData: ['websites', 'web projects', 'content', 'analytics'],
        technicalData: ['user ID', 'timestamps', 'project IDs']
      }
    };

    // Return as JSON download
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ezia-gdpr-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`
    });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}