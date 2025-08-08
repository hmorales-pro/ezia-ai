import { useLocalStorage } from "react-use";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/hooks";
import { isTheSameHtml } from "@/lib/compare-html-diff";

export const LoginModal = ({
  open,
  html,
  onClose,
  title = "Connectez-vous pour utiliser Ezia gratuitement",
  description = "Connectez-vous pour continuer à utiliser Ezia et augmenter votre limite mensuelle gratuite.",
}: {
  open: boolean;
  html?: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  description?: string;
}) => {
  const { openLoginWindow } = useUser();
  const [, setStorage] = useLocalStorage("html_content");
  const handleClick = async () => {
    if (html && !isTheSameHtml(html)) {
      setStorage(html);
    }
    openLoginWindow();
    onClose(false);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg lg:!p-8 !rounded-2xl !bg-white !border-[#E0E0E0] shadow-xl">
        <DialogTitle className="hidden" />
        <main className="flex flex-col items-start text-left relative pt-2">
          <div className="flex items-center justify-start -space-x-4 mb-5">
            <div className="size-14 rounded-full bg-[#6D3FC8]/20 shadow-sm flex items-center justify-center text-3xl opacity-70">
              💪
            </div>
            <div className="size-16 rounded-full bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] shadow-lg flex items-center justify-center text-4xl z-2">
              😎
            </div>
            <div className="size-14 rounded-full bg-[#5A35A5]/20 shadow-sm flex items-center justify-center text-3xl opacity-70">
              🙌
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1E1E1E]">{title}</p>
          <p className="text-[#666666] text-base mt-2 max-w-sm">
            {description}
          </p>
          <Button
            size="lg"
            className="w-full !text-base !h-11 mt-8 bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg hover:shadow-xl transition-all"
            onClick={handleClick}
          >
            Se connecter pour continuer
          </Button>
        </main>
      </DialogContent>
    </Dialog>
  );
};
