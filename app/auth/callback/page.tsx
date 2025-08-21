"use client";
import Link from "next/link";
import { useUser } from "@/hooks";
import { use, useState } from "react";
import { useMount, useTimeoutFn } from "react-use";

import { Button } from "@/components/ui/button";
export default function AuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) {
  const [showButton, setShowButton] = useState(false);
  const { code } = use(searchParams);
  const { loginFromCode } = useUser();

  useMount(async () => {
    if (code) {
      await loginFromCode(code);
    }
  });

  useTimeoutFn(
    () => setShowButton(true),
    7000 // Show button after 5 seconds
  );

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#ebe7e1]">
      <div className="!rounded-2xl !p-0 !bg-white !border-[#E0E0E0] min-w-xs text-center overflow-hidden ring-[8px] ring-white/20 shadow-xl">
        <header className="bg-gray-50 p-6 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-center -space-x-4 mb-3">
            <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
              🚀
            </div>
            <div className="size-11 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-2xl z-2">
              👋
            </div>
            <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
              🙌
            </div>
          </div>
          <p className="text-xl font-semibold text-[#1E1E1E]">
            Login In Progress...
          </p>
          <p className="text-sm text-[#666666] mt-1.5">
            Wait a moment while we log you in with your code.
          </p>
        </header>
        <main className="space-y-4 p-6">
          <div>
            <p className="text-sm text-[#444444] mb-4 max-w-xs">
              If you are not redirected automatically in the next 5 seconds,
              please click the button below
            </p>
            {showButton ? (
              <Link href="/">
                <Button className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white border-0 shadow-lg hover:shadow-xl transition-all">
                  Go to Home
                </Button>
              </Link>
            ) : (
              <p className="text-xs text-[#666666]">
                Please wait, we are logging you in...
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
