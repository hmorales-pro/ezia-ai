export class FacebookClient {
    tokenStore;
    clientId;
    clientSecret;
    redirectUri;
    apiVersion = 'v18.0';
    apiBaseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    constructor(tokenStore) {
        this.tokenStore = tokenStore;
        this.clientId = process.env.FACEBOOK_APP_ID || '';
        this.clientSecret = process.env.FACEBOOK_APP_SECRET || '';
        this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback';
    }
    async getAuthUrl(businessId, redirectUri) {
        const scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata';
        const state = Buffer.from(JSON.stringify({ businessId })).toString('base64');
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: redirectUri || this.redirectUri,
            state,
            scope,
            response_type: 'code',
        });
        return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?${params.toString()}`;
    }
    async post(businessId, content, mediaUrls) {
        // Simplified implementation
        throw new Error('Facebook posting not yet implemented');
    }
    async getAccountInfo(businessId) {
        // Simplified implementation
        throw new Error('Facebook account info not yet implemented');
    }
    async getAnalytics(businessId, startDate, endDate) {
        // Simplified implementation
        throw new Error('Facebook analytics not yet implemented');
    }
}
//# sourceMappingURL=facebook.js.map