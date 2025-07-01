import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { isAdmin } from '@/lib/utils/roleValidation';
import { ObjectId } from 'mongodb';

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
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Get all users with their pets using aggregation
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'pets'
        }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'userId',
          as: 'appointments'
        }
      },
      {
        $addFields: {
          petCount: { $size: '$pets' },
          appointmentCount: { $size: '$appointments' },
          lastAppointment: {
            $max: '$appointments.appointmentDate'
          }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          phone: 1,
          createdAt: 1,
          updatedAt: 1,
          emailVerified: 1,
          image: 1,
          petCount: 1,
          appointmentCount: 1,
          lastAppointment: 1,
          pets: {
            _id: 1,
            name: 1,
            species: 1,
            breed: 1,
            age: 1
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, role, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      role: role || 'Customer',
      phone,
      isActive: true,
      createdAt: new Date()
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, firstName, lastName, email, role, phone, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        role,
        phone,
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    if (!session?.user?.id || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user has pets or appointments
    const userCheck = await UserModel.aggregate([
      { $match: { _id: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: 'ownerId',
          as: 'pets'
        }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'userId',
          as: 'appointments'
        }
      }
    ]);

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userCheck[0];
    
    // If user has pets or appointments, deactivate instead of delete
    if (user.pets.length > 0 || user.appointments.length > 0) {
      const deactivatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { isActive: false, deactivatedAt: new Date() },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        data: deactivatedUser,
        message: 'User deactivated (has pets/appointments)',
        action: 'deactivated'
      });
    }

    // Safe to delete if no pets or appointments
    await UserModel.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      action: 'deleted'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
