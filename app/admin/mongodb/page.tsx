'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Users, FolderOpen, Building2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';

interface MongoDBStats {
  database: {
    connected: boolean;
    uri: string;
  };
  collections: {
    users: {
      count: number;
      recent: Array<{
        _id: string;
        email: string;
        username?: string;
        createdAt: string;
      }>;
    };
    projects: {
      count: number;
      recent: Array<{
        _id: string;
        name: string;
        createdAt: string;
      }>;
    };
    businesses: {
      count: number;
      recent: Array<{
        _id: string;
        name: string;
        createdAt: string;
      }>;
    };
  };
  timestamp: string;
  error?: string;
  message?: string;
}

export default function MongoDBAdminPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState<MongoDBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/auth/ezia');
      } else if (user.email !== 'hugomorales125@gmail.com') {
        router.push('/workspace');
      } else {
        fetchStats();
      }
    }
  }, [user, userLoading, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/mongodb-check');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des données');
      }
      
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Erreur de connexion</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">État MongoDB</h1>
          <Badge variant={stats.database.connected ? "default" : "destructive"}>
            {stats.database.connected ? "Connecté" : "Déconnecté"}
          </Badge>
        </div>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Connexion Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>État:</strong> {stats.database.connected ? " Connecté" : "L Déconnecté"}</p>
              <p><strong>URI:</strong> {stats.database.uri}</p>
              <p><strong>Dernière vérification:</strong> {new Date(stats.timestamp).toLocaleString('fr-FR')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Collections Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Utilisateurs
              </CardTitle>
              <CardDescription>{stats.collections.users.count} enregistrés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Récents:</h4>
                {stats.collections.users.recent.map((user) => (
                  <div key={user._id} className="text-sm">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Projets
              </CardTitle>
              <CardDescription>{stats.collections.projects.count} créés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Récents:</h4>
                {stats.collections.projects.recent.map((project) => (
                  <div key={project._id} className="text-sm">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Businesses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Entreprises
              </CardTitle>
              <CardDescription>{stats.collections.businesses.count} enregistrées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Récentes:</h4>
                {stats.collections.businesses.recent.map((business) => (
                  <div key={business._id} className="text-sm">
                    <p className="font-medium">{business.name}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(business.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raw JSON for debugging */}
        <Card>
          <CardHeader>
            <CardTitle>Données brutes (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}