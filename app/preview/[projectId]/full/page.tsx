"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function FullPreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectCode, setProjectCode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      setProjectCode(response.data.project.code);
    } catch (error) {
      console.error('Error fetching project:', error);
      setProjectCode(`
        <div style="text-align: center; padding: 50px; font-family: sans-serif; color: #666;">
          <h1 style="color: #333;">Erreur</h1>
          <p>Impossible de charger le projet</p>
        </div>
      `);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FAF9F5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#666666' }}>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={projectCode}
      style={{ 
        width: '100vw', 
        height: '100vh', 
        border: 'none',
        margin: 0,
        padding: 0
      }}
      title="Project Full Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}