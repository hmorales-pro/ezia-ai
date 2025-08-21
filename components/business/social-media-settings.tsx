"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Facebook, Instagram, Linkedin, Twitter, Youtube, 
  Link, Unlink, CheckCircle, AlertCircle, Settings,
  Key, Shield, Globe, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface SocialMediaSettingsProps {
  businessId: string;
}

interface SocialAccount {
  platform: string;
  connected: boolean;
  username?: string;
  profileUrl?: string;
  lastSync?: string;
  autoPost: boolean;
  postingSchedule?: {
    days: string[];
    times: string[];
  };
}

// Stockage en mémoire temporaire
declare global {
  var socialAccounts: Record<string, SocialAccount[]>;
}

if (!global.socialAccounts) {
  global.socialAccounts = {};
}

const SOCIAL_PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    authUrl: "/api/auth/facebook",
    scopes: ["pages_manage_posts", "pages_read_engagement"]
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    authUrl: "/api/auth/instagram",
    scopes: ["instagram_basic", "instagram_content_publish"]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    authUrl: "/api/auth/linkedin",
    scopes: ["w_member_social", "r_liteprofile"]
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "bg-black",
    authUrl: "/api/auth/twitter",
    scopes: ["tweet.read", "tweet.write", "users.read"]
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-600",
    authUrl: "/api/auth/youtube",
    scopes: ["youtube.upload", "youtube.readonly"]
  }
];

export function SocialMediaSettings({ businessId }: SocialMediaSettingsProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>(
    global.socialAccounts[businessId] || []
  );
  const [connecting, setConnecting] = useState<string | null>(null);

  const saveAccounts = (newAccounts: SocialAccount[]) => {
    global.socialAccounts[businessId] = newAccounts;
    setAccounts(newAccounts);
  };

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    
    try {
      // Simuler la connexion OAuth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ajouter le compte connecté
      const newAccount: SocialAccount = {
        platform: platformId,
        connected: true,
        username: `@${businessId}_${platformId}`,
        profileUrl: `https://${platformId}.com/${businessId}`,
        lastSync: new Date().toISOString(),
        autoPost: false,
        postingSchedule: {
          days: ["lundi", "mercredi", "vendredi"],
          times: ["09:00", "14:00", "18:00"]
        }
      };
      
      const existingIndex = accounts.findIndex(a => a.platform === platformId);
      let newAccounts;
      
      if (existingIndex >= 0) {
        newAccounts = [...accounts];
        newAccounts[existingIndex] = newAccount;
      } else {
        newAccounts = [...accounts, newAccount];
      }
      
      saveAccounts(newAccounts);
      toast.success(`${platformId} connecté avec succès !`);
      
    } catch (error) {
      toast.error(`Erreur lors de la connexion à ${platformId}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    const newAccounts = accounts.map(acc => 
      acc.platform === platformId 
        ? { ...acc, connected: false, username: undefined, profileUrl: undefined }
        : acc
    );
    saveAccounts(newAccounts);
    toast.success(`${platformId} déconnecté`);
  };

  const toggleAutoPost = (platformId: string) => {
    const newAccounts = accounts.map(acc => 
      acc.platform === platformId 
        ? { ...acc, autoPost: !acc.autoPost }
        : acc
    );
    saveAccounts(newAccounts);
  };

  const getAccount = (platformId: string): SocialAccount | undefined => {
    return accounts.find(a => a.platform === platformId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connexions aux réseaux sociaux</CardTitle>
          <CardDescription>
            Connectez vos comptes pour publier automatiquement vos contenus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const account = getAccount(platform.id);
              const isConnected = account?.connected || false;
              const Icon = platform.icon;
              
              return (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg text-white ${platform.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{platform.name}</h4>
                      {isConnected ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{account?.username}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">Non connecté</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`auto-${platform.id}`} className="text-sm">
                          Publication auto
                        </Label>
                        <Switch
                          id={`auto-${platform.id}`}
                          checked={account?.autoPost || false}
                          onCheckedChange={() => toggleAutoPost(platform.id)}
                        />
                      </div>
                    )}
                    
                    {isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Déconnecter
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(platform.id)}
                        disabled={connecting === platform.id}
                      >
                        {connecting === platform.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Link className="w-4 h-4 mr-2" />
                        )}
                        Connecter
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de publication */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de publication</CardTitle>
          <CardDescription>
            Configurez comment et quand publier sur vos réseaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Révision avant publication</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Approuver manuellement chaque contenu avant publication
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Adaptation automatique</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Adapter automatiquement le format selon la plateforme
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Hashtags intelligents</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Ajouter automatiquement des hashtags pertinents
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité et permissions</CardTitle>
          <CardDescription>
            Gérez les accès et la sécurité de vos comptes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Connexions sécurisées
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Toutes les connexions utilisent OAuth 2.0 et sont chiffrées
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Permissions limitées
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Nous demandons uniquement les permissions nécessaires
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Note importante
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  L'intégration réelle nécessite la configuration des API de chaque plateforme
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}