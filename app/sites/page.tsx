"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to new workspace page
export default function SitesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/workspace");
  }, [router]);

  return null;
}