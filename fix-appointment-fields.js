import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixAppointmentFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check current appointment structure
    const sampleAppointment = await db.collection('appointments').findOne();
    console.log('\n=== SAMPLE APPOINTMENT STRUCTURE ===');
    console.log('Sample appointment keys:', Object.keys(sampleAppointment || {}));
    
    // Update appointments to use customerId instead of userId
    if (sampleAppointment && sampleAppointment.userId && !sampleAppointment.customerId) {
      console.log('\n=== FIXING USER ID FIELD ===');
      const result = await db.collection('appointments').updateMany(
        { userId: { $exists: true } },
        { 
          $rename: { userId: 'customerId' }
        }
      );
      console.log(`Updated ${result.modifiedCount} appointments to use customerId`);
    }
    
    // Add missing required fields to existing appointments
    const appointmentsWithoutType = await db.collection('appointments').countDocuments({ type: { $exists: false } });
    if (appointmentsWithoutType > 0) {
      console.log('\n=== ADDING MISSING TYPE FIELD ===');
      const result = await db.collection('appointments').updateMany(
        { type: { $exists: false } },
        { $set: { type: 'Consultation' } }
      );
      console.log(`Added type field to ${result.modifiedCount} appointments`);
    }
    
    // Add missing startTime/endTime fields
    const appointmentsWithoutTimes = await db.collection('appointments').countDocuments({ 
      $or: [
        { startTime: { $exists: false } },
        { endTime: { $exists: false } }
      ]
    });
    
    if (appointmentsWithoutTimes > 0) {
      console.log('\n=== ADDING MISSING TIME FIELDS ===');
      
      // Get appointments without time fields
      const appointmentsToFix = await db.collection('appointments').find({
        $or: [
          { startTime: { $exists: false } },
          { endTime: { $exists: false } }
        ]
      }).toArray();
      
      for (const appointment of appointmentsToFix) {
        const appointmentDate = new Date(appointment.appointmentDate);
        const startTime = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;
        const endHour = appointmentDate.getHours() + 1;
        const endTime = `${endHour.toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;
        
        await db.collection('appointments').updateOne(
          { _id: appointment._id },
          { 
            $set: { 
              startTime: startTime,
              endTime: endTime
            }
          }
        );
      }
      
      console.log(`Added time fields to ${appointmentsToFix.length} appointments`);
    }
    
    // Verify the changes
    const updatedSample = await db.collection('appointments').findOne();
    console.log('\n=== UPDATED APPOINTMENT STRUCTURE ===');
    console.log('Updated appointment keys:', Object.keys(updatedSample || {}));
    
    const totalAppointments = await db.collection('appointments').countDocuments();
    console.log(`\n✅ Total appointments: ${totalAppointments}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixAppointmentFields();
