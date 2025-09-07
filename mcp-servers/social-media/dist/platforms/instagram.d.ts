import { FacebookClient } from './facebook.js';
import { TokenStore } from '../utils/token-store.js';
export declare class InstagramClient extends FacebookClient {
    constructor(tokenStore: TokenStore);
    getAuthUrl(businessId: string, redirectUri?: string): Promise<string>;
}
//# sourceMappingURL=instagram.d.ts.map