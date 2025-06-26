import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PetModel } from '@/lib/models';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    console.log('🐾 Fetching pets for user ID:', session.user.id);
    
    // Convert session user ID to ObjectId for proper comparison
    const userId = new Types.ObjectId(session.user.id);
    
    // Only use ownerId now that we've cleaned up the data structure
    const pets = await PetModel.find({ 
      ownerId: userId
    }).sort({ createdAt: -1 });
    
    console.log(`🔍 Pets API: User ${session.user.id} (${session.user.email}) found ${pets.length} pets`);
    
    return NextResponse.json({
      success: true,
      data: pets
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.species || !body.gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }    await connectDB();
    
    // Convert session user ID to ObjectId
    const userId = new Types.ObjectId(session.user.id);
    
    const petData = {
      ...body,
      ownerId: userId, // Only use ownerId for clean data structure
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`🐾 Creating pet for user ${session.user.id} (${session.user.email}):`, body.name);
    
    const pet = new PetModel(petData);
    await pet.save();
    
    return NextResponse.json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create pet' },
      { status: 500 }
    );
  }
}
