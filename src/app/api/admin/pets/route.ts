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
    
    // Fetch all pets with owner information populated using aggregation
    const pets = await db.collection('pets').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $addFields: {
          ownerId: { $arrayElemAt: ['$owner', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          species: 1,
          breed: 1,
          age: 1,
          weight: 1,
          color: 1,
          gender: 1,
          allergies: 1,
          notes: 1,
          createdAt: 1,
          'ownerId._id': 1,
          'ownerId.name': 1,
          'ownerId.email': 1,
          'ownerId.role': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    // Transform the data to match expected interface
    const transformedPets = pets.map(pet => ({
      ...pet,
      ownerId: {
        _id: pet.ownerId._id,
        firstName: pet.ownerId.name?.split(' ')[0] || 'Unknown',
        lastName: pet.ownerId.name?.split(' ').slice(1).join(' ') || '',
        email: pet.ownerId.email,
        role: pet.ownerId.role
      }
    }));

    await client.close();
    
    console.log(`🔄 Admin API: Retrieved ${transformedPets.length} pets from database`);
    
    return NextResponse.json({ 
      success: true, 
      data: transformedPets,
      message: `Retrieved ${transformedPets.length} pets for admin dashboard`
    });
    
  } catch (error) {
    console.error('🚨 Admin Pets API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch pets data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
