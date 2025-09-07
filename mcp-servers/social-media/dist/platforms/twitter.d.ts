import { TokenStore } from '../utils/token-store.js';
export declare class TwitterClient {
    private tokenStore;
    private appKey;
    private appSecret;
    private callbackUrl;
    private pendingTokens;
    constructor(tokenStore: TokenStore);
    getAuthUrl(businessId: string, redirectUri?: string): Promise<string>;
    handleCallback(businessId: string, oauthToken: string, oauthVerifier: string, state: string): Promise<void>;
    post(businessId: string, content: string, mediaUrls?: string[]): Promise<{
        id: string;
        url: string;
    }>;
    getAccountInfo(businessId: string): Promise<any>;
    getAnalytics(businessId: string, startDate?: string, endDate?: string): Promise<any>;
}
//# sourceMappingURL=twitter.d.ts.map