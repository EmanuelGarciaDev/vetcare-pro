import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';
import { PetModel } from '@/lib/models/Pet';

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
    
    // Check if user is authenticated and is a vet
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Vet') {
      return NextResponse.json({ error: 'Forbidden - Veterinarian access required' }, { status: 403 });
    }

    await connectDB();

    // Get today's date
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Get start of week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get vet statistics
    const [todayAppointments, weekAppointments, totalPatients] = await Promise.all([
      // Today's appointments count
      AppointmentModel.countDocuments({
        appointmentDate: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      }),
      
      // This week's appointments count
      AppointmentModel.countDocuments({
        appointmentDate: {
          $gte: startOfWeek
        }
      }),
      
      // Total unique patients (pets that have had appointments)
      PetModel.countDocuments()
    ]);

    // Pending records (mock for now - could be appointments without completed notes)
    const pendingRecords = await AppointmentModel.countDocuments({
      status: 'Confirmed',
      appointmentDate: { $lt: new Date() }
    });

    const stats = {
      todayAppointments,
      weekAppointments,
      totalPatients,
      pendingRecords
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching vet stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
