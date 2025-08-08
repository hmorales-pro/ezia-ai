"use client";

import { UserProvider } from "@/components/contexts/user-context";
import { AppProvider } from "@/components/contexts/app-context";
import { Toaster } from "sonner";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AppProvider>
        {children}
        <Toaster
          toastOptions={{
            style: {
              background: "#1E1E1E",
              color: "#F5F5F5",
              border: "1px solid #333333",
            },
          }}
        />
      </AppProvider>
    </UserProvider>
  );
}