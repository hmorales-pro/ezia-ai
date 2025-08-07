import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testCode = searchParams.get('code') || 'test-code-123';
  
  // Simuler l'appel à notre propre API auth
  const authUrl = new URL('/api/auth', request.url);
  
  try {
    // Test direct de notre API auth
    const response = await fetch(authUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: testCode })
    });
    
    const responseData = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = null;
    }
    
    return NextResponse.json({
      test: "Auth flow test",
      request: {
        method: "POST",
        url: authUrl.toString(),
        body: { code: testCode }
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: jsonData || responseData
      },
      debug: {
        expectedUrl: "/api/auth",
        actualUrl: authUrl.toString(),
        isRedirect: response.redirected,
        redirectUrl: response.url !== authUrl.toString() ? response.url : null
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}