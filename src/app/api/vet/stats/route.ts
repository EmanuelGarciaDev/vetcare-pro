import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AppointmentModel } from '@/lib/models/Appointment';
import { PetModel } from '@/lib/models/Pet';
import { UserModel } from '@/lib/models/User';
import { ClinicModel } from '@/lib/models/Clinic';
import { isVet } from '@/lib/utils/roleValidation';
import mongoose from 'mongoose';

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
    
    console.log('🔍 Vet Stats API - Session:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    });
    
    // Check if user is authenticated and is a vet
    if (!session?.user?.id) {
      console.log('❌ No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isVet(session.user.role || '')) {
      console.log('❌ Not a vet role:', session.user.role);
      return NextResponse.json({ error: 'Forbidden - Veterinarian access required' }, { status: 403 });
    }

    console.log('✅ Vet authentication passed');
    await connectDB();

    // Get today's date
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Get start of week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get current vet's information
    const currentVet = await UserModel.findOne({ 
      $or: [
        { email: session.user.email, role: 'Vet' },
        { email: session.user.email, role: 'Veterinarian' }
      ]
    });

    console.log('🔍 Looking for vet with email:', session.user.email);
    console.log('🩺 Found vet:', currentVet ? { id: currentVet._id, name: currentVet.name, role: currentVet.role } : 'Not found');

    if (!currentVet) {
      console.log('❌ Vet profile not found for email:', session.user.email);
      return NextResponse.json({ error: 'Vet profile not found' }, { status: 404 });
    }

    // Find clinics where this vet works
    const vetClinics = await AppointmentModel.db.db.collection('vetclinics').find({
      vets: currentVet._id
    }).toArray();

    console.log('🏥 Found clinics for vet:', vetClinics.length);
    
    if (vetClinics.length === 0) {
      console.log('⚠️ No clinics assigned to this vet');
      // Return empty stats for now
      return NextResponse.json({
        todayAppointments: 0,
        weekAppointments: 0,
        totalPatients: 0,
        pendingRecords: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalAppointments: 0,
        completionRate: 0,
        monthlyRevenue: 0,
        patientGrowth: 0,
        efficiency: 95
      });
    }

    const clinicIds = vetClinics.map((clinic: any) => clinic._id);
    console.log('🏥 Clinic IDs:', clinicIds);

    // Get vet statistics
    const [
      todayAppointments, 
      weekAppointments, 
      totalPatients, 
      pendingAppointments,
      completedAppointments,
      upcomingAppointments
    ] = await Promise.all([
      // Today's appointments count for clinics where this vet works
      AppointmentModel.countDocuments({
        clinicId: { $in: clinicIds },
        appointmentDate: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      }),
      
      // This week's appointments count for clinics where this vet works
      AppointmentModel.countDocuments({
        clinicId: { $in: clinicIds },
        appointmentDate: {
          $gte: startOfWeek
        }
      }),
      
      // Total unique patients (pets) in these clinics
      AppointmentModel.distinct('petId', { clinicId: { $in: clinicIds } }).then(pets => pets.length),
      
      // Pending appointments for these clinics
      AppointmentModel.countDocuments({
        clinicId: { $in: clinicIds },
        status: { $in: ['pending', 'Pending'] }
      }),
      
      // Completed appointments for these clinics
      AppointmentModel.countDocuments({
        clinicId: { $in: clinicIds },
        status: { $in: ['completed', 'Completed'] }
      }),
      
      // Upcoming appointments for these clinics
      AppointmentModel.countDocuments({
        clinicId: { $in: clinicIds },
        appointmentDate: { $gte: new Date() },
        status: { $in: ['pending', 'Pending', 'confirmed', 'Confirmed'] }
      })
    ]);

    // Calculate additional metrics
    const totalAppointments = pendingAppointments + completedAppointments;
    const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
    
    // Mock revenue for this vet (will be real when payment system is implemented)
    const monthlyRevenue = Math.floor(Math.random() * 15000) + 5000; // Mock: $5k-20k
    const patientGrowth = Math.floor(Math.random() * 15) + 2; // Mock: 2-17% growth

    const stats = {
      todayAppointments,
      weekAppointments,
      totalPatients,
      pendingRecords: pendingAppointments, // Keeping original field name for compatibility
      upcomingAppointments,
      completedAppointments,
      totalAppointments,
      completionRate,
      monthlyRevenue,
      patientGrowth,
      efficiency: completionRate
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching vet stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
