"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Users, Mail, Building2, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  company?: string;
  message?: string;
  source?: string;
  createdAt: string;
}

export default function AdminWaitlistPage() {
  const { user, loading: userLoading } = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userLoading) {
      if (!user || user.email !== 'hugomorales125@gmail.com') {
        router.push('/dashboard');
        return;
      }
      fetchWaitlist();
    }
  }, [user, userLoading, router]);

  const fetchWaitlist = async () => {
    try {
      const response = await api.get('/api/waitlist');
      if (response.data.success) {
        setEntries(response.data.entries);
        setCount(response.data.count);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement de la liste d'attente");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Email', 'Nom', 'Entreprise', 'Message', 'Source', 'Date d\'inscription'];
    const rows = entries.map(entry => [
      entry.id,
      entry.email,
      entry.name,
      entry.company || '',
      entry.message || '',
      entry.source || '',
      format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `waitlist_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D3FC8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-[#1E1E1E]">Liste d'attente</h1>
            </div>
            
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="gap-2"
              disabled={entries.length === 0}
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#E0E0E0]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Total inscrits</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">{count}</p>
                </div>
                <Users className="w-8 h-8 text-[#6D3FC8]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#E0E0E0]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Avec entreprise</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {entries.filter(e => e.company).length}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-[#6D3FC8]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#E0E0E0]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-[#1E1E1E]">
                    {entries.filter(e => 
                      format(new Date(e.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-[#6D3FC8]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card className="border-[#E0E0E0]">
          <CardHeader>
            <CardTitle>Inscriptions</CardTitle>
            <CardDescription>
              {count} personnes inscrites sur la liste d'attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                Aucune inscription pour le moment
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium text-[#666666]">#</th>
                      <th className="pb-3 font-medium text-[#666666]">Nom</th>
                      <th className="pb-3 font-medium text-[#666666]">Email</th>
                      <th className="pb-3 font-medium text-[#666666]">Entreprise</th>
                      <th className="pb-3 font-medium text-[#666666]">Date</th>
                      <th className="pb-3 font-medium text-[#666666]">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{index + 1}</td>
                        <td className="py-3 font-medium">{entry.name}</td>
                        <td className="py-3">
                          <a 
                            href={`mailto:${entry.email}`}
                            className="text-[#6D3FC8] hover:underline"
                          >
                            {entry.email}
                          </a>
                        </td>
                        <td className="py-3">{entry.company || '-'}</td>
                        <td className="py-3">
                          {format(new Date(entry.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary">
                            {entry.source || 'website'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {entries.filter(e => e.message).length > 0 && (
          <Card className="border-[#E0E0E0] mt-8">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Messages laissés par les inscrits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {entries.filter(e => e.message).map(entry => (
                <div key={entry.id} className="border-l-4 border-[#6D3FC8] pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-[#666666]" />
                    <span className="font-medium">{entry.name}</span>
                    {entry.company && (
                      <Badge variant="outline" className="text-xs">
                        {entry.company}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[#666666]">{entry.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}