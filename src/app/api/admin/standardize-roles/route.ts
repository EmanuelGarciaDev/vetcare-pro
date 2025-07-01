import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { isAdmin, standardizeRole } from '@/lib/utils/roleValidation';

// Extend session type to include role
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Get all users with non-standard roles
    const allUsers = await UserModel.find({}).exec();
    
    let updatedCount = 0;
    const updates: Array<{ email: string; oldRole: string; newRole: string }> = [];

    for (const user of allUsers) {
      const currentRole = user.role;
      const standardizedRole = standardizeRole(currentRole);
      
      if (currentRole !== standardizedRole) {
        // Update the user with standardized role
        await UserModel.findByIdAndUpdate(
          user._id,
          { 
            role: standardizedRole,
            updatedAt: new Date()
          }
        );
        
        updates.push({
          email: user.email,
          oldRole: currentRole,
          newRole: standardizedRole
        });
        
        updatedCount++;
      }
    }

    // Get final role distribution
    const roleStats = await UserModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();

    console.log(`Standardized ${updatedCount} user roles`);

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        updates,
        roleDistribution: roleStats
      }
    });

  } catch (error) {
    console.error('Error standardizing roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
