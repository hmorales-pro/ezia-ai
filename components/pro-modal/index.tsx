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
    window.open("https://huggingface.co/subscribe/pro?from=Ezia", "_blank");
    onClose(false);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg lg:!p-8 !rounded-2xl !bg-white !border-[#E0E0E0] shadow-xl">
        <DialogTitle className="hidden" />
        <main className="flex flex-col items-start text-left relative pt-2">
          <div className="flex items-center justify-start -space-x-4 mb-5">
            <div className="size-14 rounded-full bg-[#C837F4]/20 shadow-sm flex items-center justify-center text-3xl opacity-70">
              🚀
            </div>
            <div className="size-16 rounded-full bg-gradient-to-br from-[#C837F4] to-[#B028F2] shadow-lg flex items-center justify-center text-4xl z-2">
              🤩
            </div>
            <div className="size-14 rounded-full bg-[#B028F2]/20 shadow-sm flex items-center justify-center text-3xl opacity-70">
              🥳
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E]">
            Only $9 to enhance your possibilities
          </h2>
          <p className="text-[#666666] text-base mt-2 max-w-sm">
            It seems like you have reached the monthly free limit of Ezia.
          </p>
          <hr className="bg-[#E0E0E0] w-full max-w-[150px] my-6" />
          <p className="text-lg mt-3 text-[#1E1E1E] font-semibold">
            Upgrade to a <ProTag className="mx-1" /> Account, and unlock your
            Ezia high quota access ⚡
          </p>
          <ul className="mt-3 space-y-1 text-[#666666]">
            <li className="text-sm text-[#666666] space-x-2 flex items-center justify-start gap-2 mb-3">
              You&apos;ll also unlock some Hugging Face PRO features, like:
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-[#C837F4] size-4" />
              Get acces to thousands of AI app (ZeroGPU) with high quota
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-[#C837F4] size-4" />
              Get exclusive early access to new features and updates
            </li>
            <li className="text-sm space-x-2 flex items-center justify-start gap-2">
              <CheckCheck className="text-[#C837F4] size-4" />
              Get free credits across all Inference Providers
            </li>
            <li className="text-sm text-[#666666] space-x-2 flex items-center justify-start gap-2 mt-3">
              ... and lots more!
            </li>
          </ul>
          <Button
            size="lg"
            className="w-full !text-base !h-11 mt-8 bg-gradient-to-r from-[#C837F4] to-[#B028F2] hover:from-[#B028F2] hover:to-[#9B21D5] text-white border-0 shadow-lg hover:shadow-xl transition-all"
            onClick={handleProClick}
          >
            Subscribe to PRO ($9/month)
          </Button>
        </main>
      </DialogContent>
    </Dialog>
  );
};

const ProTag = ({ className }: { className?: string }) => (
  <span
    className={`${className} bg-gradient-to-br from-[#C837F4] to-[#B028F2] inline-block -skew-x-12 border border-[#C837F4]/20 text-xs font-bold text-white shadow-lg rounded-md px-2.5 py-0.5`}
  >
    PRO
  </span>
);
export default ProModal;
