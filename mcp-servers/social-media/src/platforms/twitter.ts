import { TwitterApi } from 'twitter-api-v2';
import { TokenStore } from '../utils/token-store.js';
import crypto from 'crypto';

interface TwitterTokens {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed?: string;
}

export class TwitterClient {
  private tokenStore: TokenStore;
  private appKey: string;
  private appSecret: string;
  private callbackUrl: string;
  private pendingTokens: Map<string, TwitterTokens> = new Map();

  constructor(tokenStore: TokenStore) {
    this.tokenStore = tokenStore;
    this.appKey = process.env.TWITTER_CONSUMER_KEY || '';
    this.appSecret = process.env.TWITTER_CONSUMER_SECRET || '';
    this.callbackUrl = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/api/auth/twitter/callback';
  }

  async getAuthUrl(businessId: string, redirectUri?: string): Promise<string> {
    try {
      const client = new TwitterApi({
        appKey: this.appKey,
        appSecret: this.appSecret,
      });

      const authLink = await client.generateAuthLink(redirectUri || this.callbackUrl, {
        linkMode: 'authorize',
      });

      // Store temporary tokens
      const tempKey = `${businessId}:${Date.now()}`;
      this.pendingTokens.set(tempKey, {
        oauth_token: authLink.oauth_token,
        oauth_token_secret: authLink.oauth_token_secret,
        oauth_callback_confirmed: authLink.oauth_callback_confirmed,
      });

      // Add business ID to the callback URL
      const url = new URL(authLink.url);
      url.searchParams.append('state', tempKey);
      
      return url.toString();
    } catch (error) {
      console.error('Twitter auth URL error:', error);
      throw new Error(`Failed to generate Twitter auth URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleCallback(
    businessId: string,
    oauthToken: string,
    oauthVerifier: string,
    state: string
  ): Promise<void> {
    try {
      const pendingTokens = this.pendingTokens.get(state);
      if (!pendingTokens) {
        throw new Error('No pending tokens found');
      }

      const client = new TwitterApi({
        appKey: this.appKey,
        appSecret: this.appSecret,
        accessToken: pendingTokens.oauth_token,
        accessSecret: pendingTokens.oauth_token_secret,
      });

      const { client: loggedClient, accessToken, accessSecret } = await client.login(oauthVerifier);
      
      // Get user info
      const user = await loggedClient.v2.me();
      
      // Store tokens
      await this.tokenStore.saveTokens(businessId, 'twitter', {
        accessToken,
        refreshToken: accessSecret, // Twitter uses accessSecret as refreshToken
        username: user.data.username,
        userId: user.data.id,
      });

      // Clean up pending tokens
      this.pendingTokens.delete(state);
    } catch (error) {
      console.error('Twitter callback error:', error);
      throw new Error(`Failed to complete Twitter authentication: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async post(
    businessId: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<{ id: string; url: string }> {
    try {
      const tokens = await this.tokenStore.getTokens(businessId, 'twitter');
      if (!tokens) {
        throw new Error('No Twitter connection found');
      }

      const client = new TwitterApi({
        appKey: this.appKey,
        appSecret: this.appSecret,
        accessToken: tokens.accessToken,
        accessSecret: tokens.refreshToken!, // Twitter stores accessSecret as refreshToken
      });

      let mediaIds: string[] = [];
      
      // Upload media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        for (const url of mediaUrls) {
          // TODO: Download and upload media
          // const mediaId = await client.v1.uploadMedia(buffer);
          // mediaIds.push(mediaId);
        }
      }

      // Post tweet
      const tweetData: any = {
        text: content,
      };
      
      if (mediaIds.length > 0) {
        tweetData.media = { media_ids: mediaIds as [string] | [string, string] | [string, string, string] | [string, string, string, string] };
      }
      
      const tweet = await client.v2.tweet(tweetData);

      return {
        id: tweet.data.id,
        url: `https://twitter.com/${tokens.username}/status/${tweet.data.id}`,
      };
    } catch (error) {
      console.error('Twitter post error:', error);
      throw new Error(`Failed to post to Twitter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAccountInfo(businessId: string): Promise<any> {
    try {
      const tokens = await this.tokenStore.getTokens(businessId, 'twitter');
      if (!tokens) {
        throw new Error('No Twitter connection found');
      }

      const client = new TwitterApi({
        appKey: this.appKey,
        appSecret: this.appSecret,
        accessToken: tokens.accessToken,
        accessSecret: tokens.refreshToken!,
      });

      const user = await client.v2.me({
        'user.fields': ['profile_image_url', 'description', 'public_metrics', 'verified'],
      });

      return {
        id: user.data.id,
        username: user.data.username,
        name: user.data.name,
        description: user.data.description,
        profileImageUrl: user.data.profile_image_url,
        verified: user.data.verified,
        metrics: user.data.public_metrics,
      };
    } catch (error) {
      console.error('Twitter account info error:', error);
      throw new Error(`Failed to get Twitter account info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAnalytics(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    try {
      const tokens = await this.tokenStore.getTokens(businessId, 'twitter');
      if (!tokens) {
        throw new Error('No Twitter connection found');
      }

      const client = new TwitterApi({
        appKey: this.appKey,
        appSecret: this.appSecret,
        accessToken: tokens.accessToken,
        accessSecret: tokens.refreshToken!,
      });

      // Get user tweets
      const timeline = await client.v2.userTimeline(tokens.userId!, {
        max_results: 100,
        'tweet.fields': ['public_metrics', 'created_at'],
        start_time: startDate ? new Date(startDate).toISOString() : undefined,
        end_time: endDate ? new Date(endDate).toISOString() : undefined,
      });

      // Calculate total metrics
      let totalImpressions = 0;
      let totalEngagements = 0;
      let totalLikes = 0;
      let totalRetweets = 0;
      let totalReplies = 0;

      const tweetsData = timeline.data.data || [];
      for (const tweet of tweetsData) {
        if (tweet.public_metrics) {
          totalImpressions += tweet.public_metrics.impression_count || 0;
          totalLikes += tweet.public_metrics.like_count || 0;
          totalRetweets += tweet.public_metrics.retweet_count || 0;
          totalReplies += tweet.public_metrics.reply_count || 0;
          totalEngagements = totalLikes + totalRetweets + totalReplies;
        }
      }

      return {
        platform: 'twitter',
        period: {
          start: startDate || 'all time',
          end: endDate || 'now',
        },
        metrics: {
          posts: tweetsData.length,
          impressions: totalImpressions,
          engagements: totalEngagements,
          likes: totalLikes,
          retweets: totalRetweets,
          replies: totalReplies,
          engagementRate: totalImpressions > 0 
            ? ((totalEngagements / totalImpressions) * 100).toFixed(2) + '%'
            : '0%',
        },
        topPosts: tweetsData.slice(0, 5).map((tweet: any) => ({
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          metrics: tweet.public_metrics,
        })),
      };
    } catch (error) {
      console.error('Twitter analytics error:', error);
      throw new Error(`Failed to get Twitter analytics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}