import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

const ADMIN_PASSWORD = "ezia2025admin";

// PATCH: Toggle beta tester status (activate/deactivate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { action } = body; // 'activate' or 'deactivate'

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (action === 'deactivate') {
      // Deactivate: set role to 'user' and isBetaTester to false
      user.role = 'user';
      if (user.betaTester) {
        user.betaTester.isBetaTester = false;
        user.betaTester.hasUnlimitedAccess = false;
      }
      user.subscription.plan = 'free';
      user.usage.imagesQuota = 0;
    } else if (action === 'activate') {
      // Reactivate: set role to 'beta' and isBetaTester to true
      user.role = 'beta';
      if (!user.betaTester) {
        user.betaTester = {
          isBetaTester: true,
          invitedAt: new Date(),
          invitedBy: 'admin',
          hasUnlimitedAccess: true,
          notes: ''
        };
      } else {
        user.betaTester.isBetaTester = true;
        user.betaTester.hasUnlimitedAccess = true;
      }
      user.subscription.plan = 'enterprise';
      user.usage.imagesQuota = 999999;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Beta tester ${action}d successfully`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        betaTester: user.betaTester
      }
    });
  } catch (error) {
    console.error('Error updating beta tester:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Completely remove beta tester (hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
    }

    const { userId } = await params;

    await dbConnect();

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Beta tester deleted successfully',
      deletedUser: {
        _id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting beta tester:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
