import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';
import { PetModel } from '@/lib/models/Pet';
import { ObjectId } from 'mongodb';

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

    // First, get all pets owned by the current user
    const userPets = await PetModel.find({ ownerId: new ObjectId(session.user.id) });
    const userPetIds = userPets.map(pet => pet._id); // Keep as ObjectId, don't convert to string

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clinicId = searchParams.get('clinic');
    const date = searchParams.get('date');
    
    // Build query filter - only include appointments for pets owned by the user
    const filter: Record<string, string | Date | object | null> = { 
      customerId: new ObjectId(session.user.id), // Convert to ObjectId!
      $or: [
        { petId: { $in: userPetIds } },  // Appointments for user's pets
        { petId: null }  // Appointments without specific pets (general consultations)
      ]
    };

    console.log('🔍 Appointments filter:', JSON.stringify(filter, null, 2));
    console.log('🔍 User pet IDs:', userPetIds);
    console.log('🔍 User ID:', session.user.id);
    
    if (status) filter.status = status;
    if (clinicId) filter.clinicId = clinicId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await AppointmentModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'vetclinics',
          localField: 'clinicId',
          foreignField: '_id',
          as: 'clinicData'
        }
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'petData'
        }
      },
      {
        $addFields: {
          clinicId: { $arrayElemAt: ['$clinicData', 0] },
          petId: { $arrayElemAt: ['$petData', 0] }
        }
      },
      {
        $project: {
          clinicData: 0,
          petData: 0
        }
      },
      { $sort: { appointmentDate: 1 } }
    ]);

    // Serialize _id fields as strings for consistency
    const serializedAppointments = appointments.map(appointment => ({
      ...appointment,
      _id: appointment._id.toString(),
      customerId: appointment.customerId.toString(), // Convert ObjectId to string
      clinicId: appointment.clinicId ? {
        ...appointment.clinicId,
        _id: appointment.clinicId._id.toString()
      } : null,
      petId: appointment.petId ? {
        ...appointment.petId,
        _id: appointment.petId._id.toString()
      } : null
    }));

    console.log(`[Appointments API] Found ${serializedAppointments.length} appointments for user ${session.user.id}`);

    return NextResponse.json({ 
      success: true, 
      data: serializedAppointments 
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
      clinicId,
      petId,
      appointmentDate,
      startTime,
      endTime,
      type,
      reason,
      notes
    } = body;

    console.log('Creating appointment with data:', {
      clinicId,
      petId,
      appointmentDate,
      startTime,
      type,
      reason,
      customerId: session.user.id
    });

    // Validate required fields
    if (!clinicId || !appointmentDate || !startTime || !reason || !type) {
      console.log('Missing required fields:', { clinicId, appointmentDate, startTime, reason, type });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: clinic, date, time, reason, and type are required' },
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

    // Check if clinic exists and is active - query vetclinics collection directly
    console.log('Looking for clinic with ID:', clinicId);
    const client = new (await import('mongodb')).MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vetcare-pro');
    const clinic = await db.collection('vetclinics').findOne({ _id: new ObjectId(clinicId) });
    await client.close();
    
    console.log('Found clinic:', clinic ? clinic.name : 'No');
    
    if (!clinic) {
      console.log('Clinic not found for ID:', clinicId);
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 400 }
      );
    }
    
    if (!clinic.isActive) {
      console.log('Clinic not active:', clinic.isActive);
      return NextResponse.json(
        { success: false, error: 'Clinic not available' },
        { status: 400 }
      );
    }

    // Create appointment date/time object
    const appointmentDateTime = new Date(`${appointmentDate}T${startTime}`);
    
    // Check if slot is already booked at this clinic
    const existingAppointment = await AppointmentModel.findOne({
      clinicId: clinicId,
      appointmentDate: appointmentDateTime,
      startTime: startTime,
      status: { $in: ['Scheduled', 'Confirmed'] }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Time slot already booked at this clinic' },
        { status: 400 }
      );
    }

    // Get pricing based on appointment type
    const appointmentPrice = clinic.pricing[type.toLowerCase() as keyof typeof clinic.pricing] || clinic.pricing.consultation;

    // Create appointment
    console.log('Creating appointment object...');
    const appointment = new AppointmentModel({
      customerId: new ObjectId(session.user.id), // Save as ObjectId for consistency
      clinicId: new ObjectId(clinicId),  // Use clinic instead of vet
      petId: petId ? new ObjectId(petId) : null,
      appointmentDate: appointmentDateTime,
      startTime: startTime,
      endTime: finalEndTime,
      type: type,
      reason,
      notes: notes || '',
      status: 'Scheduled',
      totalAmount: appointmentPrice,
      paymentStatus: 'Pending'
    });

    console.log('Saving appointment...');
    await appointment.save();
    console.log('Appointment saved successfully');

    // Manually populate clinic and pet data using correct collections
    const client2 = new (await import('mongodb')).MongoClient(process.env.MONGODB_URI!);
    await client2.connect();
    const db2 = client2.db('vetcare-pro');
    
    const populatedClinic = await db2.collection('vetclinics').findOne({ _id: new ObjectId(clinicId) });
    let populatedPet = null;
    if (petId) {
      populatedPet = await db2.collection('pets').findOne({ _id: new ObjectId(petId) });
    }
    await client2.close();

    // Create response with populated data
    const responseData = {
      ...appointment.toObject(),
      _id: appointment._id.toString(),
      customerId: appointment.customerId.toString(), // Convert ObjectId to string
      clinicId: populatedClinic ? {
        ...populatedClinic,
        _id: populatedClinic._id.toString()
      } : null,
      petId: populatedPet ? {
        ...populatedPet,
        _id: populatedPet._id.toString()
      } : null
    };

    return NextResponse.json({
      success: true,
      data: responseData,
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
