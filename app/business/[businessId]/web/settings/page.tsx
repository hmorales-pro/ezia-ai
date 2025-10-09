"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Settings, Sparkles, Globe, Bell, Lock } from "lucide-react";

export default function WebSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-[#E0E0E0]">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
            Paramètres du Projet Web
          </h2>
          <p className="text-[#666666] max-w-md mx-auto mb-8">
            Configurez votre domaine, notifications, sécurité et autres paramètres avancés.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Bientôt disponible</span>
          </div>

          {/* Fonctionnalités prévues */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="border-gray-100 bg-gray-50/50">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Domaine Personnalisé</h3>
                <p className="text-xs text-[#666666]">
                  Connectez votre propre nom de domaine
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 bg-gray-50/50">
              <CardContent className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Notifications</h3>
                <p className="text-xs text-[#666666]">
                  Gérez vos alertes et notifications
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 bg-gray-50/50">
              <CardContent className="p-6 text-center">
                <Lock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Sécurité</h3>
                <p className="text-xs text-[#666666]">
                  SSL, backups et protection
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
