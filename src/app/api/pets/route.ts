import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PetModel } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }    await connectDB();
    
    const pets = await PetModel.find({ ownerId: session.user.id }).sort({ createdAt: -1 });
    
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
    
    const petData = {
      ...body,
      ownerId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
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
