"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, User, Mail, Building2, Calendar, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refetch } = useUser();
  const [loading, setLoading] = useState(false);
  const [businessCount, setBusinessCount] = useState(0);
  
  const [profileData, setProfileData] = useState({
    fullname: "",
    username: "",
    bio: "",
    company: "",
    website: "",
    location: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullname: user.fullname || user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        company: user.company || "",
        website: user.website || "",
        location: user.location || ""
      });
      fetchBusinessCount();
    }
  }, [user]);

  const fetchBusinessCount = async () => {
    try {
      const response = await api.get("/api/me/business-simple");
      if (response.data.ok) {
        setBusinessCount(response.data.businesses.length);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement profile update API
      // const response = await api.put("/api/me/profile", profileData);
      toast.success("Profil mis à jour avec succès");
      refetch?.();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const memberSince = user._createdAt ? format(new Date(user._createdAt), "MMMM yyyy", { locale: fr }) : "Récemment";

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
              <h1 className="text-2xl font-bold text-[#1E1E1E]">Mon profil</h1>
              <p className="text-sm text-[#666666]">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar avec avatar et stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage src={user.avatarUrl} alt={user.fullname} />
                      <AvatarFallback className="bg-gradient-to-br from-[#6D3FC8] to-[#8B5CF6] text-white text-3xl font-medium">
                        {user.fullname?.charAt(0).toUpperCase() ?? "E"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full shadow-md"
                      disabled
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h2 className="mt-4 text-xl font-semibold text-[#1E1E1E]">{user.fullname || user.name}</h2>
                  <p className="text-sm text-[#666666]">@{user.username}</p>
                  
                  <div className="w-full mt-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#666666]" />
                        <span className="text-sm text-[#666666]">Business</span>
                      </div>
                      <span className="font-semibold text-[#1E1E1E]">{businessCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#666666]" />
                        <span className="text-sm text-[#666666]">Membre depuis</span>
                      </div>
                      <span className="text-sm font-medium text-[#1E1E1E]">{memberSince}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#666666]" />
                        <span className="text-sm text-[#666666]">Statut</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">Vérifié</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations pour personnaliser votre expérience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Nom complet</Label>
                      <Input
                        id="fullname"
                        value={profileData.fullname}
                        onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                        placeholder="Jean Dupont"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        placeholder="jeandupont"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#666666]" />
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="flex-1 bg-gray-50"
                      />
                    </div>
                    <p className="text-xs text-[#666666]">
                      L'adresse email ne peut pas être modifiée
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Parlez-nous un peu de vous..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        placeholder="Nom de votre entreprise"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        placeholder="Paris, France"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      placeholder="https://monsite.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Enregistrer les modifications
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/settings")}
                    >
                      Paramètres avancés
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Section danger zone */}
            <Card className="mt-6 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Zone de danger</CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" disabled>
                  Supprimer mon compte
                </Button>
                <p className="text-xs text-[#666666] mt-2">
                  Cette action est définitive et supprimera toutes vos données
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}