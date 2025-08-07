"use client";

import { AppEditor } from "@/components/editor";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProjectsNewContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const businessId = searchParams.get("businessId");
  
  return <AppEditor initialPrompt={prompt} businessId={businessId} />;
}

export default function ProjectsNewPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ProjectsNewContent />
    </Suspense>
  );
}
