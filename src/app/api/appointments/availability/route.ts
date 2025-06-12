import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';

// GET /api/appointments/availability - Check availability for a specific date
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const veterinarianId = searchParams.get('veterinarianId');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }    // Build query filter for all appointments on this date
    const filter: Record<string, unknown> = {
      status: { $in: ['Scheduled', 'Confirmed'] } // Only consider active appointments
    };

    if (veterinarianId) {
      filter.veterinarianId = veterinarianId;
    }

    // Filter by date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    filter.appointmentDate = { 
      $gte: startDate, 
      $lte: endDate 
    };

    const appointments = await AppointmentModel.find(filter)
      .select('appointmentDate veterinarianId status')
      .lean();

    // Extract just the time slots that are booked
    const bookedSlots = appointments.map(apt => {
      const date = new Date(apt.appointmentDate);
      return {
        time: date.toTimeString().substring(0, 5), // HH:MM format
        veterinarianId: apt.veterinarianId,
        status: apt.status
      };
    });

    return NextResponse.json({
      success: true,
      data: bookedSlots,
      date: date,
      total: bookedSlots.length
    });

  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
