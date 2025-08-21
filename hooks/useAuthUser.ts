"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { User } from "@/types";

export function useAuthUser() {
  const client = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auth.user"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/me-simple");
        return response.data;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return { user: null, errCode: 401 };
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });

  const user = data?.user || null;
  const errCode = data?.errCode || null;

  const openLoginWindow = () => {
    router.push("/auth/ezia");
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      
      // Clear user data
      client.setQueryData(["auth.user"], { user: null, errCode: null });
      
      // Redirect to home
      router.push("/");
      toast.success("Déconnexion réussie");
      
      // Force reload to clear all state
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const refreshUser = () => {
    refetch();
  };

  return {
    user,
    errCode,
    loading: isLoading,
    openLoginWindow,
    logout,
    refreshUser,
  };
}

export default useAuthUser;