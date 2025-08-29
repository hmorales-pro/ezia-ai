import { useLocalStorage } from "react-use";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CheckCheck } from "lucide-react";
import { isTheSameHtml } from "@/lib/compare-html-diff";

export const ProModal = ({
  open,
  html,
  onClose,
}: {
  open: boolean;
  html: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [, setStorage] = useLocalStorage("html_content");
  const handleProClick = () => {
    if (!isTheSameHtml(html)) {
      setStorage(html);
    }
    // Tarifs page is temporarily disabled
    onClose(false);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg lg:!p-8 !rounded-2xl !bg-white !border-[#E0E0E0] shadow-xl">
        <DialogTitle className="hidden" />
        <main className="flex flex-col items-start text-left relative pt-2">
          <div className="flex items-center justify-start -space-x-4 mb-5">
            <div className="size-14 rounded-full bg-[#6D3FC8]/20 shadow-sm flex items-center justify-center text-3xl opacity-70">
              🚀
            </div>
            <div className="size-16 rounded-full bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] shadow-lg flex items-center justify-center text-4xl z-2">
              🤩
            </div>
            <div className="size-14 rounded-full bg-[#5A35A5]/20 shadow-sm flex items-center justify-center text-3xl opacity-70">
              🥳
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E]">
            Seulement 9$ pour améliorer vos possibilités
          </h2>
          <p className="text-[#666666] text-base mt-2 max-w-sm">
            Il semble que vous ayez atteint la limite mensuelle gratuite d'Ezia.
          </p>
          <hr className="bg-[#E0E0E0] w-full max-w-[150px] my-6" />
          <p className="text-lg mt-3 text-[#1E1E1E] font-semibold">
            Passez à un compte <ProTag className="mx-1" /> et débloquez
            votre accès à quota élevé Ezia ⚡
          </p>
          <ul className="mt-3 space-y-1 text-[#666666]">
            <li className="text-sm text-[#666666] space-x-2 flex items-center justify-start gap-2 mb-3">
              Vous débloquerez également des fonctionnalités PRO, comme :
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-[#6D3FC8] size-4" />
              Accès à des milliers d'applications IA avec quota élevé
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-[#6D3FC8] size-4" />
              Accès anticipé exclusif aux nouvelles fonctionnalités
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-[#6D3FC8] size-4" />
              Crédits gratuits sur tous les fournisseurs d'inférence
            </li>
            <li className="text-sm text-[#666666] space-x-2 flex items-center justify-start gap-2 mt-3">
              ... et bien plus encore !
            </li>
          </ul>
          <Button
            size="lg"
            className="w-full !text-base !h-11 mt-8 bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg hover:shadow-xl transition-all"
            onClick={handleProClick}
          >
            S'abonner à PRO (9$/mois)
          </Button>
        </main>
      </DialogContent>
    </Dialog>
  );
};

const ProTag = ({ className }: { className?: string }) => (
  <span
    className={`${className} bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] inline-block -skew-x-12 border border-[#6D3FC8]/20 text-xs font-bold text-white shadow-lg rounded-md px-2.5 py-0.5`}
  >
    PRO
  </span>
);
export default ProModal;
