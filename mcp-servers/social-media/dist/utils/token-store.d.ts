interface TokenData {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    scope?: string;
    username?: string;
    userId?: string;
}
export declare class TokenStore {
    private storePath;
    private encryptionKey;
    constructor();
    private ensureStoreExists;
    private encrypt;
    private decrypt;
    saveTokens(businessId: string, platform: string, tokens: TokenData): Promise<void>;
    getTokens(businessId: string, platform: string): Promise<TokenData | null>;
    removeTokens(businessId: string, platform: string): Promise<void>;
    listAllConnections(): Promise<Array<{
        businessId: string;
        platform: string;
        username?: string;
        createdAt: number;
    }>>;
    private readStore;
}
export {};
//# sourceMappingURL=token-store.d.ts.map