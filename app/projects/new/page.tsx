"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsNewRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers la nouvelle route
    const url = new URL(window.location.href);
    const newUrl = url.href.replace('/projects/new', '/workspace/new');
    router.replace(newUrl);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6D3FC8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666]">Redirection...</p>
      </div>
    </div>
  );
}