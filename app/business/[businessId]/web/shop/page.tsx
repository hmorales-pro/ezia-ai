"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Sparkles, CreditCard, Package } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-[#E0E0E0]">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-3">
            Boutique en Ligne
          </h2>
          <p className="text-[#666666] max-w-md mx-auto mb-8">
            Vendez vos produits en ligne avec Stripe, gérez votre inventaire et suivez vos commandes.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Bientôt disponible</span>
          </div>

          {/* Fonctionnalités prévues */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="border-green-100 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Gestion Produits</h3>
                <p className="text-xs text-[#666666]">
                  Ajoutez et gérez vos produits avec l'IA
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Paiements Stripe</h3>
                <p className="text-xs text-[#666666]">
                  Intégration sécurisée des paiements
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">Suivi Commandes</h3>
                <p className="text-xs text-[#666666]">
                  Dashboard complet de vos ventes
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
