"use client";

import { use } from "react";
import { UnifiedEditor } from "@/components/editor/unified-editor";
import { useRouter } from "next/navigation";

export default function EditProjectPage({ 
  params 
}: { 
  params: Promise<{ projectId: string }> 
}) {
  const { projectId } = use(params);
  const router = useRouter();

  const handleProjectSaved = (savedProjectId: string) => {
    // Rediriger vers la liste des projets après sauvegarde
    router.push("/sites");
  };

  return (
    <UnifiedEditor 
      projectId={projectId}
      onProjectSaved={handleProjectSaved}
    />
  );
}