"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Bell, Shield, CreditCard, Loader2, Download, FileDown, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "notifications", "security", "billing", "gdpr"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  const [profile, setProfile] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    username: user?.username || ""
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: false,
    projectUpdates: true,
    weeklyReport: true
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement profile update API
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push("/auth/ezia");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-[#666666] hover:text-[#6D3FC8] hover:bg-purple-50 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#1E1E1E]">Paramètres</h1>
              <p className="text-sm text-[#666666]">Gérez votre compte et vos préférences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="gdpr">RGPD</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Nom complet</Label>
                    <Input
                      id="fullname"
                      value={profile.fullname}
                      onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-[#666666]">
                      L'email ne peut pas être modifié
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      placeholder="jeandupont"
                    />
                  </div>
                  
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mises à jour par email</Label>
                    <p className="text-sm text-[#666666]">
                      Recevez des notifications sur vos projets
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, emailUpdates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emails marketing</Label>
                    <p className="text-sm text-[#666666]">
                      Nouveautés et offres spéciales
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mises à jour des projets</Label>
                    <p className="text-sm text-[#666666]">
                      Notifications sur l'évolution de vos projets
                    </p>
                  </div>
                  <Switch
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, projectUpdates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rapport hebdomadaire</Label>
                    <p className="text-sm text-[#666666]">
                      Résumé de votre activité chaque semaine
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, weeklyReport: checked })
                    }
                  />
                </div>
                
                <Button>
                  Enregistrer les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Protégez votre compte avec ces paramètres de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mot de passe actuel</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Confirmer le nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  
                  <Button>
                    Mettre à jour le mot de passe
                  </Button>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="font-medium mb-4">Sessions actives</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Session actuelle</p>
                        <p className="text-sm text-[#666666]">Chrome sur macOS</p>
                      </div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Facturation et abonnement</CardTitle>
                <CardDescription>
                  Gérez votre abonnement et vos informations de paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Plan actuel</p>
                      <p className="text-sm text-[#666666]">Plan Gratuit</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {/* Tarifs disabled */}}
                    >
                      Changer de plan
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Historique de facturation</h3>
                  <p className="text-sm text-[#666666]">
                    Aucune facture disponible
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gdpr">
            <Card>
              <CardHeader>
                <CardTitle>Protection des données (RGPD)</CardTitle>
                <CardDescription>
                  Gérez vos données personnelles conformément au Règlement Général sur la Protection des Données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-6 bg-purple-50 rounded-lg space-y-4">
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-[#6D3FC8] mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1E1E1E]">Exporter vos données</h3>
                        <p className="text-sm text-[#666666] mt-1">
                          Téléchargez une copie complète de toutes vos données stockées sur Ezia, 
                          incluant votre profil, vos business et vos projets.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const response = await fetch('/api/me/export-data');
                          if (!response.ok) throw new Error('Erreur lors de l\'export');
                          
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `ezia-export-${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          
                          toast.success('Vos données ont été exportées avec succès');
                        } catch (error) {
                          toast.error('Erreur lors de l\'export de vos données');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Télécharger mes données
                    </Button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-[#1E1E1E]">Vos droits RGPD</h3>
                    <ul className="space-y-3 text-sm text-[#666666]">
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-[#666666]" />
                        <div>
                          <strong>Droit d'accès :</strong> Vous pouvez accéder à toutes vos données personnelles
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-[#666666]" />
                        <div>
                          <strong>Droit de rectification :</strong> Vous pouvez modifier vos informations dans votre profil
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-[#666666]" />
                        <div>
                          <strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de votre compte
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-[#666666]" />
                        <div>
                          <strong>Droit à la portabilité :</strong> Exportez vos données dans un format lisible
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-red-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-red-600">Suppression du compte</h3>
                    <p className="text-sm text-[#666666]">
                      La suppression de votre compte est une action définitive et irréversible. 
                      Pour des raisons de sécurité et afin de nous assurer de votre identité, 
                      cette procédure nécessite une vérification manuelle.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-medium text-[#1E1E1E] mb-2">
                        Pour supprimer votre compte :
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-[#666666]">
                        <li>Exportez vos données (bouton ci-dessus)</li>
                        <li>Envoyez un email à <a href="mailto:support@ezia.ai" className="text-[#6D3FC8] hover:underline">support@ezia.ai</a></li>
                        <li>Indiquez votre email de compte et la raison</li>
                        <li>Notre équipe traitera votre demande sous 72h</li>
                      </ol>
                    </div>
                    <p className="text-xs text-[#666666] text-center">
                      Cette procédure garantit la protection de votre compte contre les suppressions accidentelles ou malveillantes.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <p className="text-sm text-[#666666]">
                    Pour toute question concernant vos données personnelles ou l'exercice de vos droits RGPD, 
                    contactez notre délégué à la protection des données : 
                    <a href="mailto:privacy@ezia.ai" className="text-[#6D3FC8] hover:underline"> privacy@ezia.ai</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}