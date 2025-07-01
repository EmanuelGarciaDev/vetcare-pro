import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';
import { PetModel } from '@/lib/models/Pet';
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

export async function GET(request: Request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const species = searchParams.get('species');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get patients (pets) that have appointments in this vet's clinics
    const petIds = await AppointmentModel.distinct('petId', { 
      clinicId: { $in: clinicIds }
    });

    console.log('🐾 Found pet IDs from appointments:', petIds.length);

    if (petIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Build query for pets
    const petQuery: Record<string, any> = { _id: { $in: petIds } };
    
    if (species && species !== 'all') {
      petQuery.species = species;
    }
    
    if (search) {
      petQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    // Get patients with their owners and appointment history with this vet
    const patients = await PetModel.aggregate([
      { $match: petQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $lookup: {
          from: 'appointments',
          let: { petId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$petId', '$$petId'] },
                    { $eq: ['$vetId', currentVet._id] }
                  ]
                }
              }
            },
            { $sort: { appointmentDate: -1 } },
            { $limit: 5 } // Last 5 appointments with this vet
          ],
          as: 'appointmentHistory'
        }
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ['$owner', 0] },
          appointmentCount: { $size: '$appointmentHistory' },
          lastAppointment: { $arrayElemAt: ['$appointmentHistory', 0] },
          nextAppointment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$appointmentHistory',
                  cond: { $gte: ['$$this.appointmentDate', new Date()] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          species: 1,
          breed: 1,
          age: 1,
          weight: 1,
          color: 1,
          gender: 1,
          medicalHistory: 1,
          createdAt: 1,
          'owner.name': 1,
          'owner.email': 1,
          'owner.phone': 1,
          appointmentCount: 1,
          'lastAppointment.appointmentDate': 1,
          'lastAppointment.status': 1,
          'nextAppointment.appointmentDate': 1,
          'nextAppointment.status': 1
        }
      },
      { $sort: { 'lastAppointment.appointmentDate': -1 } },
      { $limit: limit }
    ]).exec();

    console.log(`Fetched ${patients.length} patients for vet ${currentVet.email}`);

    return NextResponse.json({
      success: true,
      data: patients
    });

  } catch (error) {
    console.error('Error fetching vet patients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
