import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { VeterinarianModel } from '@/lib/models/Veterinarian';
import { AppointmentModel } from '@/lib/models/Appointment';
import { DaySchedule } from '@/types';

// GET /api/veterinarians - Get available veterinarians
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const date = searchParams.get('date');

    // Build query filter
    const filter: Record<string, boolean | object> = { isAvailable: true };
    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    const veterinarians = await VeterinarianModel.find(filter)
      .populate('userId', 'name email image')
      .sort({ rating: -1 });

    // If date is provided, get available time slots for each vet
    if (date && veterinarians.length > 0) {
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

      const vetsWithSlots = await Promise.all(
        veterinarians.map(async (vet) => {          // Get vet's schedule for the day
          const daySchedule = vet.availability.find(
            (schedule: DaySchedule) => schedule.day === dayName && schedule.isWorking
          );

          if (!daySchedule) {
            return { ...vet.toObject(), availableSlots: [] };
          }

          // Generate time slots (30-minute intervals)
          const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);

          // Get existing appointments for this vet on this date
          const existingAppointments = await AppointmentModel.find({
            veterinarianId: vet._id,
            appointmentDate: {
              $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            },
            status: { $in: ['Scheduled', 'Confirmed'] }
          });

          // Filter out booked slots
          const bookedTimes = existingAppointments.map(apt => 
            apt.appointmentDate.toTimeString().substring(0, 5)
          );

          const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

          return { 
            ...vet.toObject(), 
            availableSlots,
            workingHours: {
              start: daySchedule.startTime,
              end: daySchedule.endTime
            }
          };
        })
      );

      return NextResponse.json({ 
        success: true, 
        data: vetsWithSlots 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: veterinarians 
    });

  } catch (error) {
    console.error('Get veterinarians error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch veterinarians' },
      { status: 500 }
    );
  }
}

// Helper function to generate time slots
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let current = start;
  while (current < end) {
    slots.push(formatTime(current));
    current += 30; // 30-minute intervals
  }
  
  return slots;
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
