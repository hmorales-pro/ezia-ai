"use client";

import { EziaEditorWrapper } from "@/components/editor/ezia-wrapper";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProjectsNewContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const businessId = searchParams.get("businessId");
  
  return <EziaEditorWrapper initialPrompt={prompt} businessId={businessId} />;
}

export default function ProjectsNewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
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
