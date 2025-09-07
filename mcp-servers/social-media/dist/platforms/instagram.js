import { FacebookClient } from './facebook.js';
// Instagram uses Facebook's API
export class InstagramClient extends FacebookClient {
    constructor(tokenStore) {
        super(tokenStore);
    }
    async getAuthUrl(businessId, redirectUri) {
        // Instagram business accounts are managed through Facebook
        // Add Instagram-specific scopes
        const baseUrl = await super.getAuthUrl(businessId, redirectUri);
        const url = new URL(baseUrl);
        const currentScope = url.searchParams.get('scope') || '';
        url.searchParams.set('scope', `${currentScope},instagram_basic,instagram_content_publish`);
        return url.toString();
    }
}
//# sourceMappingURL=instagram.js.map