import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default async function Auth() {
  // Redirect to Ezia auth page instead of HuggingFace
  redirect('/auth/ezia');
}
