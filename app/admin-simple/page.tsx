"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Search, Users, Calendar, Target, Sparkles, Lock, Video, CheckCircle2, Mail } from "lucide-react";
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

interface WebinarRegistration {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  interests: string[];
  mainChallenge?: string;
  projectDescription?: string;
  expectations?: string;
  source?: string;
  registeredAt: string;
  confirmed: boolean;
  attended?: boolean;
}

interface BetaTester {
  _id: string;
  email: string;
  fullName?: string;
  role: string;
  betaTester?: {
    isBetaTester: boolean;
    invitedAt?: string;
    invitedBy?: string;
    hasUnlimitedAccess: boolean;
    notes?: string;
  };
  createdAt: string;
  subscription?: {
    plan: string;
    validUntil?: string;
  };
}

export default function SimpleAdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"waitlist" | "webinar" | "beta">("waitlist");

  // Waitlist state
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  // Webinar state
  const [webinarRegistrations, setWebinarRegistrations] = useState<WebinarRegistration[]>([]);
  const [webinarSearchTerm, setWebinarSearchTerm] = useState("");
  const [filterChallenge, setFilterChallenge] = useState("all");
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  // Beta testers state
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [showBetaForm, setShowBetaForm] = useState(false);
  const [betaFormData, setBetaFormData] = useState({
    email: "",
    fullName: "",
    notes: "",
    hasUnlimitedAccess: true
  });
  const [creatingBeta, setCreatingBeta] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Mot de passe simple (à changer)
  const ADMIN_PASSWORD = "ezia2025admin";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoading(true);
      Promise.all([fetchWaitlist(), fetchWebinarRegistrations(), fetchBetaTesters()])
        .finally(() => {
          setLoading(false);
          toast.success("Données chargées avec succès");
        });
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const fetchWaitlist = async () => {
    try {
      const response = await fetch("/api/waitlist", {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        }
      });
      const data = await response.json();

      if (data.success && data.entries) {
        setEntries(data.entries);
      } else {
        toast.error("Impossible de charger la waitlist");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement de la waitlist");
    }
  };

  const fetchWebinarRegistrations = async () => {
    try {
      const response = await fetch("/api/webinar/register", {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        }
      });
      const data = await response.json();

      if (data.success && data.registrations) {
        setWebinarRegistrations(data.registrations);
      } else {
        toast.error("Impossible de charger les inscriptions webinaire");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des inscriptions webinaire");
    }
  };

  const resendEmail = async (email: string) => {
    setSendingEmail(email);
    try {
      const response = await fetch("/api/webinar/resend-email", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Email renvoyé avec succès !");
        // Recharger les inscriptions pour voir le statut updated
        await fetchWebinarRegistrations();
      } else {
        toast.error(data.error || "Erreur lors du renvoi de l'email");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du renvoi de l'email");
    } finally {
      setSendingEmail(null);
    }
  };

  const fetchBetaTesters = async () => {
    try {
      const response = await fetch("/api/admin/beta-testers", {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        }
      });
      const data = await response.json();

      if (data.success && data.betaTesters) {
        setBetaTesters(data.betaTesters);
      } else {
        toast.error("Impossible de charger les beta-testeurs");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des beta-testeurs");
    }
  };

  const createBetaTester = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingBeta(true);

    try {
      const response = await fetch("/api/admin/beta-testers", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        },
        body: JSON.stringify(betaFormData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Beta-testeur créé avec succès !");

        // Send invitation email automatically
        await sendBetaInvitation(data.betaTester._id, data.betaTester.password);

        // Reset form
        setBetaFormData({
          email: "",
          fullName: "",
          notes: "",
          hasUnlimitedAccess: true
        });
        setShowBetaForm(false);

        // Reload beta testers
        await fetchBetaTesters();
      } else {
        toast.error(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création du beta-testeur");
    } finally {
      setCreatingBeta(false);
    }
  };

  const sendBetaInvitation = async (userId: string, password: string) => {
    setSendingInvitation(userId);
    try {
      const response = await fetch("/api/admin/beta-testers/send-invitation", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        },
        body: JSON.stringify({ userId, password })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Invitation envoyée avec succès !");
      } else {
        toast.error(data.error || "Erreur lors de l'envoi de l'invitation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    } finally {
      setSendingInvitation(null);
    }
  };

  const exportToCSV = () => {
    if (activeTab === "waitlist") {
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
    } else {
      const headers = ["Date", "Prénom", "Nom", "Email", "Entreprise", "Fonction", "Téléphone", "Défi Principal", "Description Projet", "Attentes", "Centres d'intérêt", "Confirmé", "Source"];
      const rows = filteredWebinarRegistrations.map(reg => [
        new Date(reg.registeredAt).toLocaleDateString("fr-FR"),
        reg.firstName,
        reg.lastName,
        reg.email,
        reg.company || "",
        reg.position || "",
        reg.phone || "",
        reg.mainChallenge ? getChallengeLabel(reg.mainChallenge) : "",
        reg.projectDescription || "",
        reg.expectations || "",
        reg.interests?.join(", ") || "",
        reg.confirmed ? "Oui" : "Non",
        reg.source || "website"
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `webinar-ezia-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProfile = filterProfile === "all" || entry.profile === filterProfile;
    const matchesSource = filterSource === "all" || entry.source === filterSource;
    return matchesSearch && matchesProfile && matchesSource;
  });

  const filteredWebinarRegistrations = webinarRegistrations.filter(reg => {
    const matchesSearch =
      reg.firstName.toLowerCase().includes(webinarSearchTerm.toLowerCase()) ||
      reg.lastName.toLowerCase().includes(webinarSearchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(webinarSearchTerm.toLowerCase()) ||
      reg.company?.toLowerCase().includes(webinarSearchTerm.toLowerCase());
    const matchesChallenge = filterChallenge === "all" || reg.mainChallenge === filterChallenge;
    return matchesSearch && matchesChallenge;
  });

  const getChallengeLabel = (challenge: string): string => {
    const labels: Record<string, string> = {
      time: "Manque de temps",
      content: "Création de contenu",
      market_analysis: "Analyse de marché",
      marketing_strategy: "Stratégie marketing",
      other: "Autre"
    };
    return labels[challenge] || challenge;
  };

  const getChallengeBadge = (challenge: string | undefined) => {
    if (!challenge) return <Badge variant="secondary">Non spécifié</Badge>;

    switch (challenge) {
      case "time":
        return <Badge className="bg-red-100 text-red-700">⏰ Manque de temps</Badge>;
      case "content":
        return <Badge className="bg-blue-100 text-blue-700">📝 Création de contenu</Badge>;
      case "market_analysis":
        return <Badge className="bg-green-100 text-green-700">📊 Analyse de marché</Badge>;
      case "marketing_strategy":
        return <Badge className="bg-purple-100 text-purple-700">🎯 Stratégie marketing</Badge>;
      case "other":
        return <Badge className="bg-gray-100 text-gray-700">💡 Autre</Badge>;
      default:
        return <Badge variant="secondary">{challenge}</Badge>;
    }
  };

  const getInterestBadge = (interest: string) => {
    const labels: Record<string, string> = {
      ai_business_automation: "🤖 Automatisation IA",
      website_creation: "🌐 Site web",
      marketing_strategy: "📈 Marketing",
      market_analysis: "📊 Analyse marché",
      content_generation: "✍️ Contenu",
      other: "💡 Autre"
    };
    return labels[interest] || interest;
  };

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
          <p className="text-[#666666]">Chargement des données...</p>
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
                Administration Ezia
              </h1>
              <p className="text-[#666666] mt-2">
                Gestion des listes d'attente et inscriptions webinaire
              </p>
            </div>

            <Button onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("waitlist")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "waitlist"
                  ? "border-[#6D3FC8] text-[#6D3FC8]"
                  : "border-transparent text-[#666666] hover:text-[#1E1E1E]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Waitlist ({entries.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("webinar")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "webinar"
                  ? "border-[#6D3FC8] text-[#6D3FC8]"
                  : "border-transparent text-[#666666] hover:text-[#1E1E1E]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Webinaire ({webinarRegistrations.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("beta")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "beta"
                  ? "border-[#6D3FC8] text-[#6D3FC8]"
                  : "border-transparent text-[#666666] hover:text-[#1E1E1E]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Beta-Testeurs ({betaTesters.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content for Waitlist Tab */}
        {activeTab === "waitlist" && (
          <>
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
          </>
        )}

        {/* Content for Webinar Tab */}
        {activeTab === "webinar" && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#666666] mb-1 block">Rechercher</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                      <Input
                        type="text"
                        placeholder="Nom, email ou entreprise..."
                        value={webinarSearchTerm}
                        onChange={(e) => setWebinarSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[#666666] mb-1 block">Défi principal</label>
                    <Select value={filterChallenge} onValueChange={setFilterChallenge}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les défis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les défis</SelectItem>
                        <SelectItem value="time">⏰ Manque de temps</SelectItem>
                        <SelectItem value="content">📝 Création de contenu</SelectItem>
                        <SelectItem value="market_analysis">📊 Analyse de marché</SelectItem>
                        <SelectItem value="marketing_strategy">🎯 Stratégie marketing</SelectItem>
                        <SelectItem value="other">💡 Autre</SelectItem>
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
                      <p className="text-2xl font-bold text-[#1E1E1E]">{webinarRegistrations.length}</p>
                    </div>
                    <Video className="w-8 h-8 text-[#6D3FC8] opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666]">Confirmés</p>
                      <p className="text-2xl font-bold text-green-600">
                        {webinarRegistrations.filter(r => r.confirmed).length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666]">Avec entreprise</p>
                      <p className="text-2xl font-bold text-[#1E1E1E]">
                        {webinarRegistrations.filter(r => r.company).length}
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
                        {webinarRegistrations.filter(r => {
                          const date = new Date(r.registeredAt);
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

            {/* Registrations List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Inscriptions webinaire ({filteredWebinarRegistrations.length} résultats)
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
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Fonction</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Défi principal</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Centres d'intérêt</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Statut</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWebinarRegistrations.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).map((reg, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-4 text-sm">
                            {new Date(reg.registeredAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-[#1E1E1E]">{reg.firstName} {reg.lastName}</p>
                          </td>
                          <td className="p-4 text-sm text-[#666666]">
                            <a href={`mailto:${reg.email}`} className="hover:text-[#6D3FC8]">
                              {reg.email}
                            </a>
                          </td>
                          <td className="p-4">
                            {reg.company ? (
                              <p className="text-sm text-[#1E1E1E]">{reg.company}</p>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {reg.position ? (
                              <p className="text-sm text-[#666666]">{reg.position}</p>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {getChallengeBadge(reg.mainChallenge)}
                          </td>
                          <td className="p-4">
                            {reg.interests && reg.interests.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {reg.interests.slice(0, 2).map((interest, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {getInterestBadge(interest)}
                                  </Badge>
                                ))}
                                {reg.interests.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{reg.interests.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {reg.confirmed ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Confirmé
                              </Badge>
                            ) : (
                              <Badge variant="secondary">En attente</Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendEmail(reg.email)}
                              disabled={sendingEmail === reg.email}
                              className="gap-2"
                            >
                              <Mail className="w-3 h-3" />
                              {sendingEmail === reg.email ? "Envoi..." : "Renvoyer"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredWebinarRegistrations.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[#666666]">Aucune inscription trouvée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Content for Beta Testers Tab */}
        {activeTab === "beta" && (
          <>
            {/* Header with Add Button */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#1E1E1E]">Gestion des Beta-Testeurs</h2>
              <Button
                onClick={() => setShowBetaForm(!showBetaForm)}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                {showBetaForm ? "Annuler" : "Nouveau Beta-Testeur"}
              </Button>
            </div>

            {/* Create Beta Tester Form */}
            {showBetaForm && (
              <Card className="mb-6 border-[#6D3FC8]">
                <CardHeader>
                  <CardTitle>Créer un nouveau Beta-Testeur</CardTitle>
                  <CardDescription>
                    Un compte sera créé avec accès illimité et un email d'invitation sera envoyé automatiquement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createBetaTester} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#666666] mb-1 block">Email *</label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={betaFormData.email}
                          onChange={(e) => setBetaFormData({ ...betaFormData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm text-[#666666] mb-1 block">Nom complet *</label>
                        <Input
                          type="text"
                          placeholder="Jean Dupont"
                          value={betaFormData.fullName}
                          onChange={(e) => setBetaFormData({ ...betaFormData, fullName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-[#666666] mb-1 block">Notes (optionnel)</label>
                      <Input
                        type="text"
                        placeholder="Source, raison de l'invitation..."
                        value={betaFormData.notes}
                        onChange={(e) => setBetaFormData({ ...betaFormData, notes: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="unlimitedAccess"
                        checked={betaFormData.hasUnlimitedAccess}
                        onChange={(e) => setBetaFormData({ ...betaFormData, hasUnlimitedAccess: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="unlimitedAccess" className="text-sm text-[#666666]">
                        Accès illimité (recommandé pour les beta-testeurs)
                      </label>
                    </div>
                    <Button type="submit" disabled={creatingBeta} className="w-full">
                      {creatingBeta ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Création en cours...
                        </>
                      ) : (
                        "Créer et envoyer l'invitation"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Beta Testers List */}
            <Card>
              <CardHeader>
                <CardTitle>Beta-Testeurs ({betaTesters.length})</CardTitle>
                <CardDescription>
                  Liste de tous les utilisateurs avec un accès beta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Date création</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Nom</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Email</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Plan</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Accès</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Date invitation</th>
                        <th className="text-left p-4 text-sm font-medium text-[#666666]">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {betaTesters.map((tester) => (
                        <tr key={tester._id} className="border-b hover:bg-gray-50">
                          <td className="p-4 text-sm">
                            {new Date(tester.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-[#1E1E1E]">{tester.fullName || "-"}</p>
                          </td>
                          <td className="p-4 text-sm text-[#666666]">
                            <a href={`mailto:${tester.email}`} className="hover:text-[#6D3FC8]">
                              {tester.email}
                            </a>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-purple-100 text-purple-700">
                              {tester.subscription?.plan || "free"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {tester.betaTester?.hasUnlimitedAccess ? (
                              <Badge className="bg-green-100 text-green-700">
                                ♾️ Illimité
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Standard</Badge>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {tester.betaTester?.invitedAt
                              ? new Date(tester.betaTester.invitedAt).toLocaleDateString("fr-FR")
                              : "-"}
                          </td>
                          <td className="p-4 text-sm text-[#666666]">
                            {tester.betaTester?.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {betaTesters.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[#666666]">Aucun beta-testeur pour le moment</p>
                      <Button
                        onClick={() => setShowBetaForm(true)}
                        className="mt-4 gap-2"
                        variant="outline"
                      >
                        <Users className="w-4 h-4" />
                        Créer le premier beta-testeur
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
