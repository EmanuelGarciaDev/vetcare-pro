import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';
import { UserModel } from '@/lib/models/User';
import { isVet } from '@/lib/utils/roleValidation';

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

    if (!isVet(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Vet access required' }, { status: 403 });
    }

    await connectDB();

    // Get current vet's information
    const currentVet = await UserModel.findOne({ 
      $or: [
        { email: session.user.email, role: 'Vet' },
        { email: session.user.email, role: 'Veterinarian' }
      ]
    });

    if (!currentVet) {
      console.log('❌ Vet profile not found for email:', session.user.email);
      return NextResponse.json({ error: 'Vet profile not found' }, { status: 404 });
    }

    // Find clinics where this vet works
    const vetClinics = await AppointmentModel.db.db?.collection('vetclinics').find({
      vets: currentVet._id
    }).toArray();

    console.log('🏥 Found clinics for vet:', vetClinics?.length || 0);
    
    if (!vetClinics || vetClinics.length === 0) {
      console.log('⚠️ No clinics assigned to this vet');
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const clinicIds = vetClinics.map((clinic: any) => clinic._id);

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's appointments with populated pet and owner data
    const appointments = await AppointmentModel.aggregate([
      { 
        $match: { 
          clinicId: { $in: clinicIds },
          appointmentDate: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        }
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet'
        }
      },
      {
        $unwind: {
          path: '$pet',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'pet.ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ['$owner', 0] }
        }
      },
      {
        $project: {
          appointmentDate: 1,
          appointmentTime: 1,
          status: 1,
          reason: 1,
          notes: 1,
          type: 1,
          'pet.name': 1,
          'pet.species': 1,
          'pet.breed': 1,
          'pet.age': 1,
          'owner.name': 1,
          'owner.email': 1,
          'owner.phone': 1
        }
      },
      { $sort: { appointmentTime: 1 } }
    ]).exec();

    console.log(`Fetched ${appointments.length} today's appointments for vet ${currentVet.email}`);
    
    // Debug: Log the first few appointments to see the structure
    if (appointments.length > 0) {
      console.log('🔍 Today\'s appointment sample structure:');
      const sample = appointments[0];
      console.log('📋 Today appointment data:', {
        id: sample._id,
        date: sample.appointmentDate,
        time: sample.appointmentTime,
        status: sample.status,
        pet: sample.pet ? { name: sample.pet.name, species: sample.pet.species } : null,
        owner: sample.owner ? { name: sample.owner.name, email: sample.owner.email } : null,
        reason: sample.reason
      });
    }

    return NextResponse.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
