import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { hashPassword, isValidEmail, isStrongPassword } from '@/utils';
import { RegisterFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterFormData = await request.json();
    const { name, email, password, confirmPassword, role, phone, address } = body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
        },
        { status: 400 }
      );
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }    // Validate role
    if (role && !['Customer', 'Vet', 'Admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Customer',
      phone: phone?.trim(),
      address: address?.trim()
    });

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      createdAt: newUser.createdAt
    };

    return NextResponse.json(
      { 
        success: true, 
        data: userResponse,
        message: 'Account created successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
