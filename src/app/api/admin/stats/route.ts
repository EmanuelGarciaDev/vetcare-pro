import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { VeterinarianModel } from '@/lib/models/Veterinarian';
import { AppointmentModel } from '@/lib/models/Appointment';
import { ClinicModel } from '@/lib/models/Clinic';

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

    if (session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Get admin statistics
    const [totalUsers, totalVets, totalClinics, totalAppointments] = await Promise.all([
      UserModel.countDocuments(),
      VeterinarianModel.countDocuments(),
      ClinicModel.countDocuments(),
      AppointmentModel.countDocuments()
    ]);

    // Calculate monthly revenue (mock data for now)
    const monthlyRevenue = 0; // TODO: Implement revenue calculation when payment system is added

    const stats = {
      totalUsers,
      totalVets,
      totalClinics,
      totalAppointments,
      monthlyRevenue
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
