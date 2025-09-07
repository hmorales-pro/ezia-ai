import axios from 'axios';
export class LinkedInClient {
    tokenStore;
    clientId;
    clientSecret;
    redirectUri;
    apiBaseUrl = 'https://api.linkedin.com/v2';
    constructor(tokenStore) {
        this.tokenStore = tokenStore;
        this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
        this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
        this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';
    }
    async getAuthUrl(businessId, redirectUri) {
        const scope = 'r_liteprofile r_emailaddress w_member_social';
        const state = Buffer.from(JSON.stringify({ businessId })).toString('base64');
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: redirectUri || this.redirectUri,
            state,
            scope,
        });
        return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    }
    async handleCallback(code, state) {
        try {
            // Decode state to get businessId
            const { businessId } = JSON.parse(Buffer.from(state, 'base64').toString());
            // Exchange code for access token
            const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const { access_token, expires_in } = tokenResponse.data;
            // Get user profile
            const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const profile = profileResponse.data;
            const username = `${profile.localizedFirstName} ${profile.localizedLastName}`;
            // Store tokens
            await this.tokenStore.saveTokens(businessId, 'linkedin', {
                accessToken: access_token,
                expiresAt: Date.now() + expires_in * 1000,
                username,
                userId: profile.id,
            });
            return businessId;
        }
        catch (error) {
            console.error('LinkedIn callback error:', error);
            throw new Error(`Failed to complete LinkedIn authentication: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async post(businessId, content, mediaUrls) {
        try {
            const tokens = await this.tokenStore.getTokens(businessId, 'linkedin');
            if (!tokens) {
                throw new Error('No LinkedIn connection found');
            }
            // Get person URN
            const personUrn = `urn:li:person:${tokens.userId}`;
            // Prepare share content
            const shareContent = {
                author: personUrn,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: content,
                        },
                        shareMediaCategory: 'NONE',
                    },
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                },
            };
            // Handle media if provided
            if (mediaUrls && mediaUrls.length > 0) {
                // TODO: Implement media upload
                // This requires registering media, uploading to LinkedIn's servers, etc.
            }
            // Post to LinkedIn
            const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', shareContent, {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0',
                },
            });
            const postId = response.headers['x-restli-id'];
            const postUrn = postId.replace('urn:li:ugcPost:', '');
            return {
                id: postId,
                url: `https://www.linkedin.com/feed/update/${postUrn}/`,
            };
        }
        catch (error) {
            console.error('LinkedIn post error:', error.response?.data || error);
            throw new Error(`Failed to post to LinkedIn: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getAccountInfo(businessId) {
        try {
            const tokens = await this.tokenStore.getTokens(businessId, 'linkedin');
            if (!tokens) {
                throw new Error('No LinkedIn connection found');
            }
            const [profileResponse, emailResponse] = await Promise.all([
                axios.get('https://api.linkedin.com/v2/me', {
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken}`,
                    },
                }),
                axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken}`,
                    },
                }),
            ]);
            const profile = profileResponse.data;
            const email = emailResponse.data.elements[0]?.['handle~']?.emailAddress;
            return {
                id: profile.id,
                firstName: profile.localizedFirstName,
                lastName: profile.localizedLastName,
                email,
                profilePicture: profile.profilePicture?.displayImage,
            };
        }
        catch (error) {
            console.error('LinkedIn account info error:', error);
            throw new Error(`Failed to get LinkedIn account info: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getAnalytics(businessId, startDate, endDate) {
        try {
            const tokens = await this.tokenStore.getTokens(businessId, 'linkedin');
            if (!tokens) {
                throw new Error('No LinkedIn connection found');
            }
            // LinkedIn's analytics API is limited for personal profiles
            // This would need Organization access for full analytics
            // For now, return basic profile statistics
            const profileResponse = await axios.get(`https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))`, {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            });
            return {
                platform: 'linkedin',
                period: {
                    start: startDate || 'all time',
                    end: endDate || 'now',
                },
                metrics: {
                    note: 'Full analytics require LinkedIn Organization access',
                    profile: {
                        name: `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`,
                        id: profileResponse.data.id,
                    },
                },
            };
        }
        catch (error) {
            console.error('LinkedIn analytics error:', error);
            throw new Error(`Failed to get LinkedIn analytics: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=linkedin.js.map