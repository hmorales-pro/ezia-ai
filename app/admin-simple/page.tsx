"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Search, Users, Calendar, Target, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";

interface WaitlistEntry {
  email: string;
  name: string;
  company?: string;
  profile?: string;
  needs?: string;
  urgency?: string;
  source?: string;
  timestamp: string;
}

export default function SimpleAdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  // Mot de passe simple (à changer)
  const ADMIN_PASSWORD = "ezia2025admin";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchWaitlist();
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.entries) {
        setEntries(data.entries);
        toast.success(`${data.entries.length} entrées chargées`);
      } else {
        toast.error("Impossible de charger les données");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Nom", "Email", "Profil", "Besoins", "Urgence", "Entreprise", "Source"];
    const rows = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleDateString("fr-FR"),
      entry.name,
      entry.email,
      entry.profile || "Non spécifié",
      entry.needs || "Non spécifié",
      entry.urgency || "Non spécifié",
      entry.company || "",
      entry.source || "website"
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-ezia-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProfile = filterProfile === "all" || entry.profile === filterProfile;
    const matchesSource = filterSource === "all" || entry.source === filterSource;
    return matchesSearch && matchesProfile && matchesSource;
  });

  const getUrgencyBadge = (urgency: string | undefined) => {
    switch (urgency) {
      case "immediate":
      case "now":
        return <Badge className="bg-red-100 text-red-700">🔥 Immédiat</Badge>;
      case "3_months":
        return <Badge className="bg-orange-100 text-orange-700">📅 3 mois</Badge>;
      case "exploring":
      case "curious":
        return <Badge className="bg-blue-100 text-blue-700">🔍 Explorer</Badge>;
      case "soon":
        return <Badge className="bg-yellow-100 text-yellow-700">🙂 Bientôt</Badge>;
      default:
        return <Badge variant="secondary">{urgency || "Non spécifié"}</Badge>;
    }
  };

  const getProfileBadge = (profile: string | undefined) => {
    switch (profile) {
      case "startup":
        return <Badge className="bg-purple-100 text-purple-700">🚀 Startup</Badge>;
      case "established":
        return <Badge className="bg-green-100 text-green-700">🏢 Entreprise</Badge>;
      case "entrepreneur":
        return <Badge className="bg-blue-100 text-blue-700">💼 Entrepreneur</Badge>;
      case "association":
        return <Badge className="bg-cyan-100 text-cyan-700">🤝 Association</Badge>;
      case "tpe-pme":
        return <Badge className="bg-indigo-100 text-indigo-700">🏢 TPE/PME</Badge>;
      case "etudiant":
        return <Badge className="bg-pink-100 text-pink-700">🎓 Étudiant</Badge>;
      default:
        return <Badge variant="secondary">{profile || "Non spécifié"}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Accès Admin
            </CardTitle>
            <CardDescription>
              Entrez le mot de passe pour accéder aux listes d'attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full">
                Accéder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D3FC8] mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement de la waitlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F5] via-[#F5F3EE] to-[#EBE7E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1E1E1E] flex items-center gap-3">
                <Users className="w-8 h-8 text-[#6D3FC8]" />
                Listes d'attente Ezia
              </h1>
              <p className="text-[#666666] mt-2">
                {entries.length} inscrit{entries.length > 1 ? "s" : ""} au total
              </p>
            </div>
            
            <Button onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-[#666666] mb-1 block">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <Input
                    type="text"
                    placeholder="Nom, email ou entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-[#666666] mb-1 block">Profil</label>
                <Select value={filterProfile} onValueChange={setFilterProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les profils" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les profils</SelectItem>
                    <SelectItem value="entrepreneur">💼 Entrepreneur</SelectItem>
                    <SelectItem value="association">🤝 Association</SelectItem>
                    <SelectItem value="tpe-pme">🏢 TPE/PME</SelectItem>
                    <SelectItem value="etudiant">🎓 Étudiant</SelectItem>
                    <SelectItem value="established">🏢 Entreprise établie</SelectItem>
                    <SelectItem value="startup">🚀 Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-[#666666] mb-1 block">Source</label>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sources</SelectItem>
                    <SelectItem value="waitlist-v2-compact">Page Startup</SelectItem>
                    <SelectItem value="/waitlist-enterprise">Page Enterprise</SelectItem>
                    <SelectItem value="website">Autre source</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Total inscrits</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">{entries.length}</p>
                </div>
                <Users className="w-8 h-8 text-[#6D3FC8] opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Urgents</p>
                  <p className="text-2xl font-bold text-red-600">
                    {entries.filter(e => e.urgency === "immediate" || e.urgency === "now").length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Entreprises</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {entries.filter(e => e.profile === "established" || e.profile === "tpe-pme").length}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-[#6D3FC8] opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Cette semaine</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {entries.filter(e => {
                      const date = new Date(e.timestamp);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return date > weekAgo;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-[#6D3FC8] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Inscriptions ({filteredEntries.length} résultats)
            </CardTitle>
            <CardDescription>
              Triées par date d'inscription (plus récentes en premier)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Nom</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Entreprise</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Profil</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Besoins</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Urgence</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-sm">
                        {new Date(entry.timestamp).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-[#1E1E1E]">{entry.name}</p>
                      </td>
                      <td className="p-4 text-sm text-[#666666]">
                        {entry.email}
                      </td>
                      <td className="p-4">
                        {entry.company ? (
                          <p className="text-sm text-[#1E1E1E]">{entry.company}</p>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getProfileBadge(entry.profile)}
                      </td>
                      <td className="p-4">
                        {entry.needs ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-[#666666] truncate" title={entry.needs}>
                              {entry.needs}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Non spécifié</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getUrgencyBadge(entry.urgency)}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {entry.source === "waitlist-v2-compact" ? "Startup" : 
                           entry.source === "/waitlist-enterprise" ? "Enterprise" : 
                           entry.source || "Website"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredEntries.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#666666]">Aucune entrée trouvée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}