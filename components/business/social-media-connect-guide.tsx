"use client";

import { useState } from "react";
import { 
  Facebook, Instagram, Linkedin, Twitter, Youtube, 
  ExternalLink, Copy, CheckCircle, Info, Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  authUrl?: string;
  setupSteps: string[];
  requiredScopes: string[];
  webhookUrl?: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    authUrl: "/api/auth/facebook",
    setupSteps: [
      "Créez une application sur developers.facebook.com",
      "Ajoutez les permissions pages_manage_posts, pages_read_engagement",
      "Configurez l'URL de callback : https://votre-domaine.com/api/auth/facebook/callback",
      "Copiez l'App ID et l'App Secret dans vos variables d'environnement"
    ],
    requiredScopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"]
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    authUrl: "/api/auth/instagram",
    setupSteps: [
      "Utilisez la même app Facebook (Instagram est lié à Facebook)",
      "Activez Instagram Basic Display dans votre app Facebook",
      "Ajoutez les permissions instagram_basic, instagram_content_publish",
      "Connectez votre compte Instagram Business à votre page Facebook"
    ],
    requiredScopes: ["instagram_basic", "instagram_content_publish"]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    authUrl: "/api/auth/linkedin",
    setupSteps: [
      "Créez une application sur linkedin.com/developers",
      "Demandez l'accès aux produits Marketing Developer Platform",
      "Configurez l'URL de callback : https://votre-domaine.com/api/auth/linkedin/callback",
      "Ajoutez les scopes r_organization_social, w_organization_social"
    ],
    requiredScopes: ["r_organization_social", "w_organization_social", "r_liteprofile"]
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "#1DA1F2",
    authUrl: "/api/auth/twitter",
    setupSteps: [
      "Créez une app sur developer.twitter.com",
      "Activez OAuth 2.0 dans les paramètres de l'app",
      "Configurez l'URL de callback : https://votre-domaine.com/api/auth/twitter/callback",
      "Générez les clés API et les tokens d'accès"
    ],
    requiredScopes: ["tweet.read", "tweet.write", "users.read"]
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    authUrl: "/api/auth/youtube",
    setupSteps: [
      "Activez l'API YouTube Data v3 dans Google Cloud Console",
      "Créez des identifiants OAuth 2.0",
      "Configurez l'URL de callback : https://votre-domaine.com/api/auth/youtube/callback",
      "Ajoutez les scopes youtube.upload et youtube.readonly"
    ],
    requiredScopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]
  }
];

export function SocialMediaConnectGuide({ businessId }: { businessId: string }) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copié !`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleConnect = async (platform: Platform) => {
    if (!platform.authUrl) {
      setSelectedPlatform(platform);
      setShowSetupDialog(true);
      return;
    }

    setIsConnecting(platform.id);
    
    // En production, cela ouvrirait une fenêtre OAuth
    // Pour le développement, on simule la connexion
    try {
      // Ouvrir la fenêtre d'authentification OAuth
      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const authWindow = window.open(
        `${platform.authUrl}?businessId=${businessId}`,
        `${platform.name} Auth`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Écouter les messages de la fenêtre OAuth
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'oauth-success' && event.data.platform === platform.id) {
          setConnectedPlatforms([...connectedPlatforms, platform.id]);
          toast.success(`${platform.name} connecté avec succès !`);
          authWindow?.close();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'oauth-error') {
          toast.error(`Erreur lors de la connexion à ${platform.name}`);
          authWindow?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Simulation pour le développement
      setTimeout(() => {
        setConnectedPlatforms([...connectedPlatforms, platform.id]);
        toast.success(`${platform.name} connecté avec succès (mode démo)`);
        authWindow?.close();
      }, 3000);

    } catch (error) {
      toast.error(`Erreur lors de la connexion à ${platform.name}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const getCallbackUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com';
    return `${baseUrl}/api/auth/[platform]/callback`;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Pour publier automatiquement sur les réseaux sociaux, vous devez d'abord connecter vos comptes.
          Chaque plateforme nécessite une configuration spécifique via leur interface développeur.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connectedPlatforms.includes(platform.id);
          const isLoading = isConnecting === platform.id;

          return (
            <Card key={platform.id} className={isConnected ? "border-green-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: platform.color }} />
                    </div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                  </div>
                  {isConnected && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connecté
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Permissions requises :
                    <ul className="mt-1 space-y-1">
                      {platform.requiredScopes.slice(0, 3).map((scope) => (
                        <li key={scope} className="text-xs">• {scope}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConnect(platform)}
                      disabled={isLoading || isConnected}
                      className="flex-1"
                    >
                      {isLoading ? "Connexion..." : isConnected ? "Reconnecter" : "Connecter"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setShowSetupDialog(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de configuration */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedPlatform && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <selectedPlatform.icon className="h-5 w-5" style={{ color: selectedPlatform.color }} />
                  Configuration {selectedPlatform.name}
                </DialogTitle>
                <DialogDescription>
                  Suivez ces étapes pour configurer l'intégration avec {selectedPlatform.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-medium mb-2">Étapes de configuration :</h4>
                  <ol className="space-y-3">
                    {selectedPlatform.setupSteps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>URL de callback</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={getCallbackUrl().replace('[platform]', selectedPlatform.id)}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(
                          getCallbackUrl().replace('[platform]', selectedPlatform.id),
                          "URL de callback"
                        )}
                      >
                        {copiedText === "URL de callback" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Variables d'environnement requises</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg font-mono text-xs space-y-1">
                      <div>{selectedPlatform.id.toUpperCase()}_CLIENT_ID=votre_client_id</div>
                      <div>{selectedPlatform.id.toUpperCase()}_CLIENT_SECRET=votre_client_secret</div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Une fois la configuration terminée sur la plateforme {selectedPlatform.name}, 
                      ajoutez les variables d'environnement et redémarrez l'application.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                  Fermer
                </Button>
                <Button asChild>
                  <a 
                    href={`https://developers.${selectedPlatform.id}.com`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    Aller sur la plateforme
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}