import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Test direct password hashing and comparison
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    
    return NextResponse.json({
      message: 'Bcrypt test',
      passwordToTest: testPassword,
      hashedPassword: hashedPassword.substring(0, 20) + '...',
      comparisonResult: isValid,
      bcryptWorking: true
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Bcrypt error',
      message: error.message
    }, { status: 500 });
  }
}