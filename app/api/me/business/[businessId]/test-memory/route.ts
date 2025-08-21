import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  const params = await context.params;
  const { businessId } = params;
  
  return NextResponse.json({
    success: true,
    message: "Test memory route works!",
    businessId: businessId,
    timestamp: new Date()
  });
}