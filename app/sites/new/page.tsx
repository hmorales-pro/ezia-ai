"use client";

import { EziaSimpleEditor } from "@/components/editor/ezia-simple-editor";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProjectsNewContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const businessId = searchParams.get("businessId");
  
  // Récupérer le nom du business depuis l'URL ou utiliser un nom par défaut
  const businessName = searchParams.get("businessName") || "Mon Business";
  
  return (
    <EziaSimpleEditor 
      initialPrompt={prompt} 
      businessId={businessId}
      businessName={businessName}
    />
  );
}

export default function ProjectsNewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#666666]">Préparation de l'éditeur...</p>
        </div>
      </div>
    }>
      <ProjectsNewContent />
    </Suspense>
  );
}
