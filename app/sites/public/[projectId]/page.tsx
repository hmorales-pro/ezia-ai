"use client";

import { useEffect, useState, use } from "react";
import { Loader2 } from "lucide-react";

export default function PublicSitePage({ 
  params 
}: { 
  params: Promise<{ projectId: string }> 
}) {
  const { projectId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchSite();
    }
  }, [projectId]);

  const fetchSite = async () => {
    try {
      console.log('Fetching site with projectId:', projectId);
      const response = await fetch(`/api/sites/public/${projectId}`);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status);
        setError(true);
        return;
      }
      
      const html = await response.text();
      console.log('HTML received, length:', html.length);
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