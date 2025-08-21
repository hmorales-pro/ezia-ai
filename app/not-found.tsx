"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#6D3FC8] mb-4">404</h1>
          <div className="text-6xl mb-8">🤖</div>
        </div>
        
        <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">
          Page introuvable
        </h2>
        
        <p className="text-[#666666] mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-[#6D3FC8] text-[#6D3FC8] hover:bg-[#6D3FC8] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Page précédente
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-[#666666]">
          <p>Besoin d'aide ? Contactez Ezia et son équipe.</p>
        </div>
      </div>
    </div>
  );
}