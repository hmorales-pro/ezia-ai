import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const eziaToken = cookieStore.get('ezia-auth-token');
  
  return NextResponse.json({
    allCookies: allCookies.map(c => ({ name: c.name, valueLength: c.value?.length || 0 })),
    eziaTokenExists: !!eziaToken,
    eziaTokenLength: eziaToken?.value?.length || 0,
  });
}