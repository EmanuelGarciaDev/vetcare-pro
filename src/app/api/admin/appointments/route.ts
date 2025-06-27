import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    // Only allow admin users to access this endpoint
    if (session.user.role !== 'Admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Connect directly to MongoDB to work with existing data structure
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vetcare-pro');
    
    // Fetch all appointments with pet, owner, and clinic information populated using aggregation
    const appointments = await db.collection('appointments').aggregate([
      {
        $lookup: {
          from: 'pets',
          localField: 'petId',
          foreignField: '_id',
          as: 'pet'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { petOwnerId: { $arrayElemAt: ['$pet.ownerId', 0] } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$petOwnerId'] }
              }
            }
          ],
          as: 'owner'
        }
      },
      {
        $lookup: {
          from: 'vetclinics',
          localField: 'clinicId',
          foreignField: '_id',
          as: 'clinic'
        }
      },
      {
        $addFields: {
          petId: {
            $mergeObjects: [
              { $arrayElemAt: ['$pet', 0] },
              {
                ownerId: { $arrayElemAt: ['$owner', 0] }
              }
            ]
          },
          clinicId: { $arrayElemAt: ['$clinic', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          appointmentDate: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          type: 1,
          reason: 1,
          notes: 1,
          diagnosis: 1,
          treatment: 1,
          totalAmount: 1,
          paymentStatus: 1,
          createdAt: 1,
          'petId._id': 1,
          'petId.name': 1,
          'petId.species': 1,
          'petId.ownerId._id': 1,
          'petId.ownerId.name': 1,
          'petId.ownerId.email': 1,
          'clinicId._id': 1,
          'clinicId.name': 1,
          'clinicId.address': 1
        }
      },
      {
        $sort: { appointmentDate: -1 }
      }
    ]).toArray();

    // Transform the data to match expected interface
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment,
      appointmentTime: appointment.startTime, // Add appointmentTime field for compatibility
      petId: {
        ...appointment.petId,
        ownerId: {
          _id: appointment.petId.ownerId._id,
          firstName: appointment.petId.ownerId.name?.split(' ')[0] || 'Unknown',
          lastName: appointment.petId.ownerId.name?.split(' ').slice(1).join(' ') || '',
          email: appointment.petId.ownerId.email
        }
      },
      clinicId: {
        ...appointment.clinicId,
        location: `${appointment.clinicId.address?.city || ''}, ${appointment.clinicId.address?.state || ''}`.trim().replace(/^,\s*/, '') || 'Unknown Location'
      }
    }));

    await client.close();
    
    console.log(`🔄 Admin API: Retrieved ${transformedAppointments.length} appointments from database`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedAppointments,
      message: `Retrieved ${transformedAppointments.length} appointments for admin dashboard`
    });
    
  } catch (error) {
    console.error('🚨 Admin Appointments API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch appointments data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
