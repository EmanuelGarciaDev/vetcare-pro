import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PetModel } from '@/lib/models';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();
    
    const pet = await PetModel.findOne({ 
      _id: id, 
      ownerId: session.user.id 
    });
    
    if (!pet) {
      return NextResponse.json({ success: false, error: 'Pet not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pet' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await context.params;
    
    // Validate required fields
    if (!body.name || !body.species || !body.gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const pet = await PetModel.findOneAndUpdate(
      { _id: id, ownerId: session.user.id },
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!pet) {
      return NextResponse.json({ success: false, error: 'Pet not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pet' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();
    
    const pet = await PetModel.findOneAndDelete({ 
      _id: id, 
      ownerId: session.user.id 
    });
    
    if (!pet) {
      return NextResponse.json({ success: false, error: 'Pet not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete pet' },
      { status: 500 }
    );
  }
}
