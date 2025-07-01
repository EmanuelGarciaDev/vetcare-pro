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

    // Get today's appointments
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayAppointments = await AppointmentModel.countDocuments({
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    // Calculate revenue metrics (mock data for now - will be real when payment system is implemented)
    const monthlyRevenue = Math.floor(Math.random() * 50000) + 25000; // Mock: $25k-75k
    const totalRevenue = Math.floor(Math.random() * 500000) + 200000; // Mock: $200k-700k
    
    // Calculate growth percentages (mock data)
    const revenueGrowth = Math.floor(Math.random() * 30) + 5; // Mock: 5-35% growth
    const userGrowth = Math.floor(Math.random() * 20) + 3; // Mock: 3-23% growth

    const stats = {
      totalUsers,
      totalVets,
      totalClinics,
      totalAppointments,
      monthlyRevenue,
      totalRevenue,
      todayAppointments,
      revenueGrowth,
      userGrowth
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
