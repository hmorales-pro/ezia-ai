"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PublicSitePage() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetchSite();
  }, [projectId]);

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/sites/public/${projectId}`);
      
      if (!response.ok) {
        setError(true);
        return;
      }
      
      const html = await response.text();
      setHtmlContent(html);
    } catch (err) {
      console.error("Error loading site:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Site non trouvé</h1>
          <p className="text-gray-600">Ce site n'existe pas ou n'est pas publié.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
      style={{ minHeight: '100vh' }}
    />
  );
}