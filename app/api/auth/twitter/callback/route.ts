import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SocialConnection from '@/models/SocialConnection';
import { withMCPClient } from '@/lib/mcp/social-media-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');
    const state = searchParams.get('state');
    const denied = searchParams.get('denied');

    // Check if user denied access
    if (denied) {
      return NextResponse.redirect(
        new URL('/auth/error?error=access_denied&provider=twitter', request.url)
      );
    }

    if (!oauth_token || !oauth_verifier || !state) {
      return NextResponse.redirect(
        new URL('/auth/error?error=missing_params&provider=twitter', request.url)
      );
    }

    // Extract businessId from state
    const businessId = state.split(':')[0];

    await connectToDatabase();

    // Handle callback using MCP
    try {
      await withMCPClient(async (client) => {
        // This would be handled by the MCP server's Twitter client
        // For now, we'll create a mock connection
        console.log('Twitter callback:', { oauth_token, oauth_verifier, state });
      });

      // For demo purposes, create a mock connection
      const mockConnection = new SocialConnection({
        businessId,
        platform: 'twitter',
        isActive: true,
        username: 'demo_user',
        profileImageUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        tokenRef: 'demo_token_ref',
        settings: {
          autoPost: false,
          postingSchedule: {
            days: ['monday', 'wednesday', 'friday'],
            times: ['09:00', '14:00', '19:00'],
          },
        },
        totalPosts: 0,
        metrics: {
          totalImpressions: 0,
          totalEngagements: 0,
          avgEngagementRate: 0,
        },
      });

      await mockConnection.save();

      // Redirect back to business page with success
      return NextResponse.redirect(
        new URL(`/business/${businessId}?tab=social&success=twitter`, request.url)
      );
    } catch (error) {
      console.error('Twitter OAuth callback error:', error);
      return NextResponse.redirect(
        new URL('/auth/error?error=callback_failed&provider=twitter', request.url)
      );
    }
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?error=server_error&provider=twitter', request.url)
    );
  }
}