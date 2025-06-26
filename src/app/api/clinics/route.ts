import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

// GET /api/clinics - Get all active clinics
export async function GET() {
  try {
    await connectDB();
    
    // Query the vetclinics collection directly since that's where the data is
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db('vetcare-pro');
    
    const clinics = await db.collection('vetclinics')
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();

    await client.close();

    // Serialize ObjectIds to strings and ensure consistent structure
    const serializedClinics = clinics.map(clinic => ({
      _id: clinic._id.toString(),
      name: clinic.name,
      address: clinic.address,
      phone: clinic.contact?.phone || clinic.phone,
      email: clinic.contact?.email || clinic.email,
      services: clinic.services || [],
      hours: clinic.hours || {},
      pricing: clinic.pricing || {
        consultation: 75,
        vaccination: 45,
        checkup: 60,
        emergency: 150,
        surgery: 300,
        grooming: 40
      },
      features: clinic.features || [],
      rating: clinic.rating || 4.5,
      reviewCount: clinic.reviewCount || 0,
      isActive: clinic.isActive,
      isEmergency24h: clinic.isEmergency24h || false
    }));

    console.log(`[Clinics API] Found ${serializedClinics.length} active clinics from vetclinics collection`);

    return NextResponse.json({ 
      success: true, 
      data: serializedClinics 
    });

  } catch (error) {
    console.error('Get clinics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}
