import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';
import { VeterinarianModel } from '@/lib/models/Veterinarian';

// Extend session type to include user id
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

// GET /api/appointments - Get user's appointments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const veterinarianId = searchParams.get('veterinarian');
    const date = searchParams.get('date');    // Build query filter
    const filter: Record<string, string | Date | object> = { customerId: session.user.id };
    if (status) filter.status = status;
    if (veterinarianId) filter.vetId = veterinarianId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await AppointmentModel.find(filter)
      .populate('vetId', 'userId specializations consultationFee')
      .populate('petId', 'name species breed')
      .sort({ appointmentDate: 1 });

    return NextResponse.json({ 
      success: true, 
      data: appointments 
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vetId,
      petId,
      appointmentDate,
      startTime,
      endTime,
      type,
      reason,
      notes
    } = body;

    // Validate required fields
    if (!vetId || !appointmentDate || !startTime || !reason || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use provided endTime or calculate it (assume 1 hour appointment)
    let finalEndTime = endTime;
    if (!finalEndTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + 1;
      finalEndTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    await connectDB();

    // Check if veterinarian exists and is available
    const veterinarian = await VeterinarianModel.findById(vetId);
    if (!veterinarian || !veterinarian.isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Veterinarian not available' },
        { status: 400 }
      );
    }

    // Create appointment date/time object
    const appointmentDateTime = new Date(`${appointmentDate}T${startTime}`);
    
    // Check if slot is already booked
    const existingAppointment = await AppointmentModel.findOne({
      vetId: vetId,
      appointmentDate: appointmentDateTime,
      status: { $in: ['Scheduled', 'Confirmed'] }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Time slot already booked' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = new AppointmentModel({
      customerId: session.user.id,  // Changed from userId to customerId
      vetId: vetId,
      petId: petId || null,
      appointmentDate: appointmentDateTime,
      startTime: startTime,   // Added startTime
      endTime: finalEndTime,            // Added endTime
      type: type,        // Added required type field
      reason,
      notes: notes || '',
      status: 'Scheduled',
      totalAmount: veterinarian.consultationFee,
      paymentStatus: 'Pending'
    });

    await appointment.save();

    // Populate the response
    await appointment.populate('vetId', 'userId specializations consultationFee');
    if (petId) {
      await appointment.populate('petId', 'name species breed');
    }

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment scheduled successfully'
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
