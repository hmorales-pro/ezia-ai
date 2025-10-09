"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ContentCalendar } from "@/components/editor/content-calendar";
import { toast } from "sonner";

export default function BlogCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    fetchProjectId();
  }, [businessId]);

  const fetchProjectId = async () => {
    try {
      const response = await api.get(`/api/web-projects/${businessId}`);
      if (response.data.success) {
        setProjectId(response.data.webProject.projectId);
        setLoading(false);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Aucun projet web trouvé');
        router.push(`/business/${businessId}/web/overview`);
      }
      setLoading(false);
    }
  };

  const handleArticleCreated = () => {
    // Optionnel: Callback après création d'article
    toast.success('Article planifié avec succès');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[#666666]">Projet non trouvé</p>
      </div>
    );
  }

  return (
    <ContentCalendar
      projectId={projectId}
      onArticleCreated={handleArticleCreated}
    />
  );
}
