"use client";

import { use } from "react";
import { EziaSimpleEditor } from "@/components/editor/ezia-simple-editor";
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
    <EziaSimpleEditor 
      projectId={projectId}
      onProjectSaved={handleProjectSaved}
    />
  );
}