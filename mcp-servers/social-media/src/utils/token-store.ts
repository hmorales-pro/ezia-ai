import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  username?: string;
  userId?: string;
}

interface StoredToken extends TokenData {
  businessId: string;
  platform: string;
  createdAt: number;
  updatedAt: number;
}

export class TokenStore {
  private storePath: string;
  private encryptionKey: Buffer;

  constructor() {
    // Use a proper data directory
    this.storePath = path.join(
      process.env.HOME || process.env.USERPROFILE || '.',
      '.ezia',
      'social-tokens.json'
    );
    
    // Use environment variable for encryption key or generate one
    const keyString = process.env.MCP_ENCRYPTION_KEY || 'default-dev-key-change-in-production';
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32);
  }

  private async ensureStoreExists(): Promise<void> {
    try {
      await fs.access(this.storePath);
    } catch {
      const dir = path.dirname(this.storePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.storePath, '{}', 'utf-8');
    }
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  private decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(16, 32);
    const encrypted = buffer.slice(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }

  async saveTokens(
    businessId: string,
    platform: string,
    tokens: TokenData
  ): Promise<void> {
    await this.ensureStoreExists();
    
    const store = await this.readStore();
    const key = `${businessId}:${platform}`;
    
    const storedToken: StoredToken = {
      ...tokens,
      businessId,
      platform,
      createdAt: store[key]?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    
    // Encrypt sensitive data
    const encryptedToken = {
      ...storedToken,
      accessToken: this.encrypt(storedToken.accessToken),
      refreshToken: storedToken.refreshToken ? this.encrypt(storedToken.refreshToken) : undefined,
    };
    
    store[key] = encryptedToken;
    await fs.writeFile(this.storePath, JSON.stringify(store, null, 2), 'utf-8');
  }

  async getTokens(
    businessId: string,
    platform: string
  ): Promise<TokenData | null> {
    await this.ensureStoreExists();
    
    const store = await this.readStore();
    const key = `${businessId}:${platform}`;
    const encryptedToken = store[key];
    
    if (!encryptedToken) {
      return null;
    }
    
    // Check if token is expired
    if (encryptedToken.expiresAt && encryptedToken.expiresAt < Date.now()) {
      // TODO: Implement token refresh logic here
      console.log(`Token expired for ${platform}/${businessId}`);
    }
    
    // Decrypt sensitive data
    return {
      accessToken: this.decrypt(encryptedToken.accessToken),
      refreshToken: encryptedToken.refreshToken ? this.decrypt(encryptedToken.refreshToken) : undefined,
      expiresAt: encryptedToken.expiresAt,
      scope: encryptedToken.scope,
      username: encryptedToken.username,
      userId: encryptedToken.userId,
    };
  }

  async removeTokens(businessId: string, platform: string): Promise<void> {
    await this.ensureStoreExists();
    
    const store = await this.readStore();
    const key = `${businessId}:${platform}`;
    
    delete store[key];
    await fs.writeFile(this.storePath, JSON.stringify(store, null, 2), 'utf-8');
  }

  async listAllConnections(): Promise<Array<{
    businessId: string;
    platform: string;
    username?: string;
    createdAt: number;
  }>> {
    await this.ensureStoreExists();
    
    const store = await this.readStore();
    return Object.values(store).map(token => ({
      businessId: token.businessId,
      platform: token.platform,
      username: token.username,
      createdAt: token.createdAt,
    }));
  }

  private async readStore(): Promise<Record<string, StoredToken>> {
    try {
      const data = await fs.readFile(this.storePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
}