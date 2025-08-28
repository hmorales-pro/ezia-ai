"use client";

import { MultipageEditor } from "@/components/editor/multipage-editor";

export default function EditMultipagePage({ 
  params 
}: { 
  params: { projectId: string } 
}) {
  return (
    <MultipageEditor 
      projectId={params.projectId}
    />
  );
}