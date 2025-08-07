import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") || "unknown";
  const origin = request.headers.get("origin") || "unknown";
  const referer = request.headers.get("referer") || "unknown";
  
  const isHuggingFace = host.includes("hf.space") || host.includes("huggingface");
  const correctDomain = host.includes("hmorales-ezia.hf.space");
  
  const expectedRedirectUri = `https://hmorales-ezia.hf.space/auth/callback`;
  const actualRedirectUri = `${host.includes("localhost") ? "http://" : "https://"}${host}/auth/callback`;
  
  return NextResponse.json({
    debug: {
      host,
      origin,
      referer,
      isHuggingFace,
      correctDomain,
      expectedRedirectUri,
      actualRedirectUri,
      redirectUriMatch: expectedRedirectUri === actualRedirectUri,
      environment: {
        hasOAuthClientId: !!process.env.OAUTH_CLIENT_ID,
        hasOAuthClientSecret: !!process.env.OAUTH_CLIENT_SECRET,
      }
    },
    recommendation: !correctDomain ? 
      "The host doesn't match 'hmorales-ezia.hf.space'. Make sure you're accessing the app from the correct URL." :
      "Configuration looks correct."
  });
}