"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/lib/performance/debounce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Search, Filter, Loader2, Plus, 
  Globe, BarChart3, Calendar, Users, 
  FileText, Package, Target, TrendingUp,
  ArrowLeft, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { projectsApi } from "@/lib/api-projects";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WorkspaceItem {
  id: string;
  type: 'website' | 'analysis' | 'content' | 'strategy';
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBusiness, setFilterBusiness] = useState<string>("all");
  const [businesses, setBusinesses] = useState<any[]>([]);

  // Debounce search for performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      // Fetch businesses
      const businessResponse = await api.get("/api/me/business-simple");
      if (businessResponse.data.ok) {
        setBusinesses(businessResponse.data.businesses);
      }

      // Fetch projects (websites) - Utiliser la nouvelle API avec fallback
      const projectsResponse = await projectsApi.getProjects();
      
      const workspaceItems: WorkspaceItem[] = [];
      
      // Convert projects to workspace items
      if (projectsResponse.ok) {
        projectsResponse.projects.forEach((project: any) => {
          workspaceItems.push({
            id: project._id || project.id,
            type: 'website',
            businessId: project.businessId || '',
            businessName: project.businessName || 'Projet indépendant',
            title: project.name,
            description: project.description,
            status: project.status === 'published' ? 'active' : project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            metadata: project.metadata
          });
        });
      }

      // Add business analyses as workspace items
      businessResponse.data.businesses.forEach((business: any) => {
        if (business.market_analysis) {
          workspaceItems.push({
            id: `analysis-${business._id}`,
            type: 'analysis',
            businessId: business.business_id,
            businessName: business.name,
            title: 'Analyse de marché',
            description: 'Analyse complète du marché et de la concurrence',
            status: 'completed',
            createdAt: business._createdAt,
            updatedAt: business._updatedAt || business._createdAt
          });
        }
      });

      setItems(workspaceItems);
    } catch (error) {
      console.error("Error fetching workspace data:", error);
      toast.error("Erreur lors du chargement de l'espace de travail");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.businessName.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesBusiness = filterBusiness === "all" || item.businessId === filterBusiness;
      
      return matchesSearch && matchesType && matchesBusiness;
    });
  }, [items, debouncedSearchQuery, filterType, filterBusiness]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website': return Globe;
      case 'analysis': return BarChart3;
      case 'content': return FileText;
      case 'strategy': return Target;
      default: return Package;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'website': return 'Site web';
      case 'analysis': return 'Analyse';
      case 'content': return 'Contenu';
      case 'strategy': return 'Stratégie';
      default: return 'Autre';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">Mon espace de travail</h1>
                <p className="text-sm text-[#666666]">
                  Gérez tous les aspects de votre business en un seul endroit
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push("/workspace/new")}
              className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans votre espace de travail..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="website">Sites web</option>
                <option value="analysis">Analyses</option>
                <option value="content">Contenus</option>
                <option value="strategy">Stratégies</option>
              </select>

              {businesses.length > 0 && (
                <select
                  value={filterBusiness}
                  onChange={(e) => setFilterBusiness(e.target.value)}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm"
                >
                  <option value="all">Tous les business</option>
                  {businesses.map(business => (
                    <option key={business.business_id} value={business.business_id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666]">Total projets</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">{items.length}</p>
                </div>
                <Package className="w-8 h-8 text-[#6D3FC8]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666]">Sites actifs</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {items.filter(i => i.type === 'website' && i.status === 'active').length}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666]">Analyses</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {items.filter(i => i.type === 'analysis').length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#666666]">Business</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">{businesses.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-[#666666] mb-4">
                {searchQuery 
                  ? "Aucun résultat trouvé pour votre recherche"
                  : "Votre espace de travail est vide"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => router.push("/business/new")}
                  className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
                >
                  Créer votre premier business
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              
              return (
                <Card 
                  key={item.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (item.type === 'website') {
                      router.push(`/sites/${item.id}/edit`);
                    } else if (item.type === 'analysis') {
                      router.push(`/business/${item.businessId}`);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-[#6D3FC8]" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <p className="text-sm text-[#666666]">{item.businessName}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'active' ? 'Actif' : 
                         item.status === 'completed' ? 'Terminé' : 'Brouillon'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#666666] mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#666666]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.updatedAt), "d MMM yyyy", { locale: fr })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}