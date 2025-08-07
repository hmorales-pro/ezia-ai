import { TiUserAdd } from "react-icons/ti";
import { Link } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { useCopyToClipboard } from "react-use";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteFriends() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copyToClipboard] = useCopyToClipboard();

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            size="iconXs"
            variant="outline"
            className="!border-[#E0E0E0] !text-[#666666] !hover:!border-[#6D3FC8] hover:!text-[#6D3FC8]"
          >
            <TiUserAdd className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg lg:!p-8 !rounded-2xl !bg-white !border-[#E0E0E0] shadow-xl">
          <DialogTitle className="hidden" />
          <main>
            <div className="flex items-center justify-start -space-x-4 mb-5">
              <div className="size-11 rounded-full bg-[#6D3FC8]/20 shadow-sm flex items-center justify-center text-2xl">
                😎
              </div>
              <div className="size-11 rounded-full bg-gradient-to-br from-[#6D3FC8] to-[#5A35A5] shadow-lg flex items-center justify-center text-2xl z-2">
                😇
              </div>
              <div className="size-11 rounded-full bg-[#5A35A5]/20 shadow-sm flex items-center justify-center text-2xl">
                😜
              </div>
            </div>
            <p className="text-xl font-semibold text-[#1E1E1E] max-w-[200px]">
              Invite your friends to join us!
            </p>
            <p className="text-sm text-[#666666] mt-2 max-w-sm">
              Support us and share the love and let them know about our awesome
              platform.
            </p>
            <div className="mt-4 space-x-3.5">
              <a
                href="https://x.com/intent/post?url=https://hmorales-ezia.hf.space/&text=Checkout%20this%20awesome%20Ai%20Tool!%20Vibe%20coding%20has%20never%20been%20so%20easy✨"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="lightGray"
                  size="sm"
                  className="!text-[#666666] hover:!text-[#6D3FC8]"
                >
                  <FaXTwitter className="size-4" />
                  Share on
                </Button>
              </a>
              <Button
                variant="lightGray"
                size="sm"
                className="!text-neutral-700"
                onClick={() => {
                  copyToClipboard("https://hmorales-ezia.hf.space/");
                  toast.success("Invite link copied to clipboard!");
                }}
              >
                <Link className="size-4" />
                Copy Invite Link
              </Button>
            </div>
          </main>
        </DialogContent>
      </form>
    </Dialog>
  );
}
