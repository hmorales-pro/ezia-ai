import { redirect } from "next/navigation";
import { Metadata } from "next";

import { getAuth } from "@/app/actions/auth";

export const revalidate = 1;

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default async function Auth() {
  const loginRedirectUrl = await getAuth();
  if (loginRedirectUrl) {
    redirect(loginRedirectUrl);
  }

  return (
    <div className="p-4 min-h-screen bg-[#EDEAE3]">
      <div className="border bg-red-50 border-red-200 text-red-600 px-5 py-3 rounded-lg max-w-md mx-auto mt-10 shadow-md">
        <h1 className="text-xl font-bold text-red-700">Error</h1>
        <p className="text-sm text-red-600">
          An error occurred while trying to log in. Please try again later.
        </p>
      </div>
    </div>
  );
}
