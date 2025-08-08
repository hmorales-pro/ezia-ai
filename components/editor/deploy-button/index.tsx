/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MdSave } from "react-icons/md";
import { Rocket } from "lucide-react";

import { Globe } from "lucide-react";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { LoginModal } from "@/components/login-modal";
import { useUser } from "@/hooks";

export function DeployButton({
  html,
  prompts,
}: {
  html: string;
  prompts: string[];
}) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [config, setConfig] = useState({
    title: "",
  });

  const createSpace = async () => {
    if (!config.title) {
      toast.error("Veuillez entrer un titre pour votre site.");
      return;
    }
    setLoading(true);

    try {
      const res = await api.post("/api/me/projects", {
        title: config.title,
        html,
        prompts,
      });
      if (res.data.ok) {
        router.push(`/projects/${res.data.path}?deploy=true`);
      } else {
        toast.error(res?.data?.error || "Échec de la création du projet");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // TODO add a way to do not allow people to deploy if the html is broken.

  return (
    <div className="flex items-center justify-end gap-5">
      <div className="relative flex items-center justify-end">
        {user?.id ? (
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <Button variant="default" className="max-lg:hidden !px-4">
                  <MdSave className="size-4" />
                  Publier votre projet
                </Button>
                <Button variant="default" size="sm" className="lg:hidden">
                  Publier
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="!rounded-2xl !p-0 !bg-white !border-neutral-200 min-w-xs text-center overflow-hidden"
              align="end"
            >
              <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
                <div className="flex items-center justify-center -space-x-4 mb-3">
                  <div className="size-9 rounded-full bg-amber-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                    🚀
                  </div>
                  <div className="size-11 rounded-full bg-red-200 shadow-2xl flex items-center justify-center z-2">
                    <Globe className="size-6 text-[#6D3FC8]" />
                  </div>
                  <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                    👻
                  </div>
                </div>
                <p className="text-xl font-semibold text-neutral-950">
                  Publier votre site!
                </p>
                <p className="text-sm text-neutral-500 mt-1.5">
                  Enregistrez et publiez votre projet en ligne. Une façon simple
                  de partager votre création avec le monde.
                </p>
              </header>
              <main className="space-y-4 p-6">
                <div>
                  <p className="text-sm text-neutral-700 mb-2">
                    Choisissez un titre pour votre site :
                  </p>
                  <Input
                    type="text"
                    placeholder="Mon Super Site"
                    value={config.title}
                    onChange={(e) =>
                      setConfig({ ...config, title: e.target.value })
                    }
                    className="!bg-white !border-neutral-300 !text-neutral-800 !placeholder:text-neutral-400 selection:!bg-blue-100"
                  />
                </div>
                <div>
                  <p className="text-sm text-neutral-700 mb-2">
                    Ensuite, publiez-le en ligne !
                  </p>
                  <Button
                    variant="black"
                    onClick={createSpace}
                    className="relative w-full"
                    disabled={loading}
                  >
                    Publier le site <Rocket className="size-4" />
                    {loading && (
                      <Loading className="ml-2 size-4 animate-spin" />
                    )}
                  </Button>
                </div>
              </main>
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <Button
              variant="default"
              className="max-lg:hidden !px-4"
              onClick={() => setOpen(true)}
            >
              <MdSave className="size-4" />
              Enregistrer votre projet
            </Button>
            <Button
              variant="default"
              size="sm"
              className="lg:hidden"
              onClick={() => setOpen(true)}
            >
              Enregistrer
            </Button>
          </>
        )}
        <LoginModal
          open={open}
          onClose={() => setOpen(false)}
          html={html}
          title="Connectez-vous pour enregistrer votre projet"
          description="Connectez-vous pour enregistrer votre projet et augmenter votre limite mensuelle gratuite."
        />
      </div>
    </div>
  );
}
