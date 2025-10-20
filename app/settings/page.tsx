"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Bell, Shield, CreditCard, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  
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
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
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
                      onClick={() => router.push('/pricing')}
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
        </Tabs>
      </div>
    </div>
  );
}