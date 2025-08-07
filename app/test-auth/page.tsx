"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

export default function TestAuthPage() {
  const { user, openLoginWindow, logout } = useUser();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleLogin = async () => {
    addLog("Starting login process...");
    try {
      await openLoginWindow();
      addLog("Redirecting to auth page...");
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleLogout = async () => {
    addLog("Logging out...");
    await logout();
    addLog("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test d&apos;Authentification OAuth</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>État de l&apos;authentification</CardTitle>
            <CardDescription>Informations sur l&apos;utilisateur connecté</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>Nom :</strong> {user.name}</p>
                <p><strong>Nom complet :</strong> {user.fullname || "Non disponible"}</p>
                <p><strong>ID :</strong> {user.id}</p>
                <Button onClick={handleLogout} variant="destructive" className="mt-4">
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Aucun utilisateur connecté</p>
                <Button onClick={handleLogin}>
                  Se connecter avec HuggingFace
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs de débogage</CardTitle>
            <CardDescription>Suivi du processus d&apos;authentification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {logs.length > 0 ? logs.join('\n') : "Aucun log pour le moment"}
              </pre>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>URL actuelle :</strong> {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
              <p><strong>OAuth redirect URI :</strong> https://hmorales-ezia.hf.space/auth/callback</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}