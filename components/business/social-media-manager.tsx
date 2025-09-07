'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Twitter, Linkedin, Facebook, Instagram, Loader2, CheckCircle, XCircle, Send } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SocialConnection {
  platform: string;
  isActive: boolean;
  username?: string;
  profileImageUrl?: string;
  lastPostAt?: string;
  totalPosts?: number;
}

interface SocialMediaManagerProps {
  businessId: string;
}

const platformConfig = {
  twitter: {
    name: 'Twitter (X)',
    icon: Twitter,
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600',
  },
};

export default function SocialMediaManager({ businessId }: SocialMediaManagerProps) {
  const api = useApi();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, [businessId]);

  const fetchConnections = async () => {
    try {
      const response = await api.get(`/api/businesses/${businessId}/social/connections`);
      setConnections(response.data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Erreur lors du chargement des connexions');
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async (platform: string) => {
    setConnecting(platform);
    try {
      const response = await api.post(`/api/businesses/${businessId}/social/connect`, {
        platform,
        redirectUri: `${window.location.origin}/api/auth/${platform}/callback`,
      });

      // Redirect to OAuth URL
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error(`Erreur lors de la connexion à ${platformConfig[platform as keyof typeof platformConfig].name}`);
      setConnecting(null);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    try {
      await api.post(`/api/businesses/${businessId}/social/disconnect`, { platform });
      toast.success(`Déconnecté de ${platformConfig[platform as keyof typeof platformConfig].name}`);
      fetchConnections();
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const publishContent = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) {
      toast.error('Veuillez saisir du contenu et sélectionner au moins une plateforme');
      return;
    }

    setPublishing(true);
    try {
      const response = await api.post(`/api/businesses/${businessId}/social/post`, {
        content,
        platforms: selectedPlatforms,
      });

      const { results } = response.data;
      const successful = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;

      if (successful > 0) {
        toast.success(`Publié avec succès sur ${successful} plateforme(s)`);
      }
      if (failed > 0) {
        toast.error(`Échec de publication sur ${failed} plateforme(s)`);
      }

      // Clear form on success
      if (successful > 0) {
        setContent('');
        setSelectedPlatforms([]);
        fetchConnections();
      }
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Erreur lors de la publication');
    } finally {
      setPublishing(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const connectedPlatforms = connections.filter(c => c.isActive).map(c => c.platform);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connexions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comptes connectés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(platformConfig).map(([platform, config]) => {
            const connection = connections.find(c => c.platform === platform);
            const isConnected = connection?.isActive;
            const Icon = config.icon;

            return (
              <div
                key={platform}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{config.name}</p>
                    {isConnected && connection?.username && (
                      <p className="text-sm text-gray-500">@{connection.username}</p>
                    )}
                  </div>
                </div>
                
                {isConnected ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectPlatform(platform)}
                    >
                      Déconnecter
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectPlatform(platform)}
                    disabled={connecting === platform}
                  >
                    {connecting === platform ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Connecter'
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Publication */}
      {connectedPlatforms.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Publier du contenu</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                placeholder="Que voulez-vous partager aujourd'hui ?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                {content.length} caractères
              </p>
            </div>

            <div>
              <Label>Plateformes</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {connectedPlatforms.map(platform => {
                  const config = platformConfig[platform as keyof typeof platformConfig];
                  const Icon = config.icon;
                  const isSelected = selectedPlatforms.includes(platform);

                  return (
                    <label
                      key={platform}
                      className={`
                        flex items-center space-x-2 p-3 border rounded-lg cursor-pointer
                        transition-colors
                        ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}
                      `}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePlatform(platform)}
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{config.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={publishContent}
              disabled={!content.trim() || selectedPlatforms.length === 0 || publishing}
              className="w-full"
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publication en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Message si aucune connexion */}
      {connectedPlatforms.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">
            Connectez vos comptes de réseaux sociaux pour commencer à publier du contenu.
          </p>
          <p className="text-sm text-gray-400">
            Vos identifiants sont sécurisés et chiffrés. Vous pouvez vous déconnecter à tout moment.
          </p>
        </Card>
      )}
    </div>
  );
}