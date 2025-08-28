"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Filter, Search, Users, Calendar, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  company?: string;
  message?: string;
  profile?: string;
  needs?: string;
  urgency?: string;
  source?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function WaitlistAdminPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const response = await api.get("/api/waitlist");
      if (response.data.success) {
        setEntries(response.data.entries);
      } else {
        toast.error("Erreur lors du chargement de la waitlist");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Non autorisé");
        router.push("/auth/ezia");
      } else if (error.response?.status === 403) {
        toast.error("Accès réservé aux administrateurs");
        router.push("/workspace");
      } else {
        toast.error("Erreur lors du chargement");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Nom", "Email", "Profil", "Besoins", "Urgence", "Entreprise", "Source"];
    const rows = filteredEntries.map(entry => [
      new Date(entry.createdAt).toLocaleDateString("fr-FR"),
      entry.name,
      entry.email,
      entry.profile || "Non spécifié",
      entry.needs || "Non spécifié",
      entry.urgency || "Non spécifié",
      entry.company || "",
      entry.source || "website"
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
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
    const matchesUrgency = filterUrgency === "all" || entry.urgency === filterUrgency;
    return matchesSearch && matchesProfile && matchesUrgency;
  });

  const getUrgencyBadge = (urgency: string | undefined) => {
    switch (urgency) {
      case "now":
        return <Badge className="bg-red-100 text-red-700">🔥 Urgent</Badge>;
      case "soon":
        return <Badge className="bg-orange-100 text-orange-700">🙂 Bientôt</Badge>;
      case "curious":
        return <Badge className="bg-blue-100 text-blue-700">👀 Curieux</Badge>;
      default:
        return <Badge variant="secondary">Non spécifié</Badge>;
    }
  };

  const getProfileIcon = (profile: string | undefined) => {
    const icons: { [key: string]: string } = {
      "entrepreneur": "💼",
      "association": "🤝",
      "tpe-pme": "🏢",
      "etudiant": "🎓"
    };
    return icons[profile || ""] || "✨";
  };

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
          <Link href="/workspace" className="inline-flex items-center gap-2 text-[#666666] hover:text-[#6D3FC8] mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au workspace
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1E1E1E] flex items-center gap-3">
                <Users className="w-8 h-8 text-[#6D3FC8]" />
                Liste d'attente Ezia
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
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-[#666666] mb-1 block">Urgence</label>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les urgences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les urgences</SelectItem>
                    <SelectItem value="now">🔥 Urgent</SelectItem>
                    <SelectItem value="soon">🙂 Bientôt</SelectItem>
                    <SelectItem value="curious">👀 Curieux</SelectItem>
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
                    {entries.filter(e => e.urgency === "now").length}
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
                  <p className="text-sm text-[#666666]">Entrepreneurs</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {entries.filter(e => e.profile === "entrepreneur").length}
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
                      const date = new Date(e.createdAt);
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
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Profil</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Besoins</th>
                    <th className="text-left p-4 text-sm font-medium text-[#666666]">Urgence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-sm">
                        {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-[#1E1E1E]">{entry.name}</p>
                          {entry.company && (
                            <p className="text-xs text-[#666666]">{entry.company}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#666666]">
                        {entry.email}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{getProfileIcon(entry.profile)}</span>
                          <span className="text-sm">{entry.profile || "Non spécifié"}</span>
                        </div>
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