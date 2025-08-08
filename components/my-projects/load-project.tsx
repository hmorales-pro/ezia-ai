"use client";
import { useState } from "react";
import { Import } from "lucide-react";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/loading";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useUser } from "@/hooks";
import { LoginModal } from "../login-modal";
import { useRouter } from "next/navigation";

export const LoadProject = ({
  fullXsBtn = false,
  onSuccess,
}: {
  fullXsBtn?: boolean;
  onSuccess: (project: Project) => void;
}) => {
  const { user } = useUser();
  const router = useRouter();

  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const checkIfUrlIsValid = (url: string) => {
    // should match a valid URL pattern
    const urlPattern = new RegExp(
      /^(https?:\/\/)?(([\w-]+\.)+[\w-]+)(\/(\S*)?)?$/,
      "i"
    );
    return urlPattern.test(url);
  };

  const handleClick = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading
    if (!url) {
      toast.error("Veuillez entrer une URL.");
      return;
    }
    if (!checkIfUrlIsValid(url)) {
      toast.error("Veuillez entrer une URL valide.");
      return;
    }

    // Extract username and namespace from URL - for now, use a placeholder
    const urlParts = url.split('/');
    const username = "user";
    const namespace = urlParts[urlParts.length - 1] || "project";

    setIsLoading(true);
    try {
      const response = await api.post(`/api/me/projects/${username}/${namespace}`);
      toast.success("Projet importé avec succès !");
      setOpen(false);
      setUrl("");
      onSuccess(response.data.project);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.data?.redirect) {
        return router.push(error.response.data.redirect);
      }
      toast.error(
        error?.response?.data?.error ?? "Failed to import the project."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!user ? (
        <>
          <Button
            variant="outline"
            className="max-lg:hidden"
            onClick={() => setOpenLoginModal(true)}
          >
            <Import className="size-4 mr-1.5" />
            Charger un projet existant
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setOpenLoginModal(true)}
          >
            {fullXsBtn && <Import className="size-3.5 mr-1" />}
            Charger
            {fullXsBtn && " un projet"}
          </Button>
          <LoginModal
            open={openLoginModal}
            onClose={setOpenLoginModal}
            title="Connectez-vous pour charger votre projet"
            description="Connectez-vous pour charger un projet existant et augmenter votre limite gratuite."
          />
        </>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div>
              <Button variant="outline" className="max-lg:hidden">
                <Import className="size-4 mr-1.5" />
                Charger un projet existant
              </Button>
              <Button variant="outline" size="sm" className="lg:hidden">
                {fullXsBtn && <Import className="size-3.5 mr-1" />}
                Charger
                {fullXsBtn && " un projet"}
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md !p-0 !rounded-3xl !bg-white !border-neutral-100 overflow-hidden text-center">
            <DialogTitle className="hidden" />
            <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
              <div className="flex items-center justify-center -space-x-4 mb-3">
                <div className="size-11 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-2xl opacity-50">
                  🎨
                </div>
                <div className="size-13 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-3xl z-2">
                  🥳
                </div>
                <div className="size-11 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-2xl opacity-50">
                  💎
                </div>
              </div>
              <p className="text-2xl font-semibold text-neutral-950">
                Importer un projet
              </p>
              <p className="text-base text-neutral-500 mt-1.5">
                Entrez l'URL de votre projet pour l'importer dans Ezia.
              </p>
            </header>
            <main className="space-y-4 px-9 pb-9 pt-2">
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Entrez l'URL de votre projet
                </p>
                <Input
                  type="text"
                  placeholder="https://exemple.com/votre-projet"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={(e) => {
                    const inputUrl = e.target.value.trim();
                    if (!inputUrl) {
                      setUrl("");
                      return;
                    }
                    if (!checkIfUrlIsValid(inputUrl)) {
                      toast.error("Veuillez entrer une URL valide.");
                      return;
                    }
                    setUrl(inputUrl);
                  }}
                  className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-700 mb-2">
                  Importez votre projet !
                </p>
                <Button
                  variant="black"
                  onClick={handleClick}
                  className="relative w-full"
                >
                  {isLoading ? (
                    <>
                      <Loading
                        overlay={false}
                        className="ml-2 size-4 animate-spin"
                      />
                      Récupération de votre projet...
                    </>
                  ) : (
                    <>Importer votre projet</>
                  )}
                </Button>
              </div>
            </main>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
