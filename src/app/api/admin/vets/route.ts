import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { isAdmin } from '@/lib/utils/roleValidation';

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

export async function GET() {
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

    // Get all vets with their appointments and specializations
    const vets = await UserModel.aggregate([
      {
        $match: { role: 'Vet' }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'vetId',
          as: 'appointments'
        }
      },
      {
        $lookup: {
          from: 'veterinarians',
          localField: '_id',
          foreignField: 'userId',
          as: 'vetProfile'
        }
      },
      {
        $addFields: {
          appointmentCount: { $size: '$appointments' },
          completedAppointments: {
            $size: {
              $filter: {
                input: '$appointments',
                cond: { $eq: ['$$this.status', 'Completed'] }
              }
            }
          },
          pendingAppointments: {
            $size: {
              $filter: {
                input: '$appointments',
                cond: { $eq: ['$$this.status', 'Pending'] }
              }
            }
          },
          lastAppointment: {
            $max: '$appointments.appointmentDate'
          },
          vetDetails: { $arrayElemAt: ['$vetProfile', 0] }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          phone: 1,
          createdAt: 1,
          updatedAt: 1,
          emailVerified: 1,
          image: 1,
          appointmentCount: 1,
          completedAppointments: 1,
          pendingAppointments: 1,
          lastAppointment: 1,
          specializations: '$vetDetails.specializations',
          licenseNumber: '$vetDetails.licenseNumber',
          experience: '$vetDetails.experience',
          consultationFee: '$vetDetails.consultationFee',
          rating: '$vetDetails.rating',
          reviewCount: '$vetDetails.reviewCount',
          isAvailable: '$vetDetails.isAvailable'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).exec();

    console.log(`Fetched ${vets.length} vets for admin dashboard`);

    return NextResponse.json({
      success: true,
      data: vets
    });

  } catch (error) {
    console.error('Error fetching vets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
