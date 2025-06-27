import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';

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

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Get today's appointments
    const appointments = await AppointmentModel.find({
      appointmentDate: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    })
    .populate('petId', 'name ownerId')
    .populate({
      path: 'petId',
      populate: {
        path: 'ownerId',
        select: 'name'
      }
    })
    .sort({ startTime: 1 })
    .lean();

    // Format appointments for vet dashboard
    const formattedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      petName: appointment.petId?.name || 'Unknown Pet',
      ownerName: appointment.petId?.ownerId?.name || 'Unknown Owner',
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      type: appointment.type,
      status: appointment.status
    }));

    return NextResponse.json(formattedAppointments);

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
