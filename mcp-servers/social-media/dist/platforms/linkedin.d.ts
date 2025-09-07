import { TokenStore } from '../utils/token-store.js';
export declare class LinkedInClient {
    private tokenStore;
    private clientId;
    private clientSecret;
    private redirectUri;
    private apiBaseUrl;
    constructor(tokenStore: TokenStore);
    getAuthUrl(businessId: string, redirectUri?: string): Promise<string>;
    handleCallback(code: string, state: string): Promise<string>;
    post(businessId: string, content: string, mediaUrls?: string[]): Promise<{
        id: string;
        url: string;
    }>;
    getAccountInfo(businessId: string): Promise<any>;
    getAnalytics(businessId: string, startDate?: string, endDate?: string): Promise<any>;
}
//# sourceMappingURL=linkedin.d.ts.map