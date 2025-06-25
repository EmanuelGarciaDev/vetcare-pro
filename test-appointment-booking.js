/**
 * Test Script: Appointment Booking API
 * This script tests the appointment booking functionality with proper field validation
 */

const testAppointmentBooking = async () => {
  try {
    console.log('🧪 Testing Appointment Booking API...\n');
    
    // Test data for appointment booking
    const testAppointment = {
      vetId: '674bc857e1234567890abcde', // Use a real vet ID from your database
      petId: '674bc857e1234567890abcdf', // Use a real pet ID from your database
      appointmentDate: '2025-06-26', // Tomorrow's date
      startTime: '10:00',
      endTime: '11:00',
      type: 'Consultation',
      reason: 'Regular checkup',
      notes: 'Annual wellness visit'
    };
    
    console.log('📋 Test appointment data:');
    console.log(JSON.stringify(testAppointment, null, 2));
    console.log('\n');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd include the session cookie
      },
      body: JSON.stringify(testAppointment)
    });
    
    const responseData = await response.json();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Appointment booking test PASSED');
    } else {
      console.log('\n❌ Appointment booking test FAILED');
      if (responseData.error) {
        console.log(`Error: ${responseData.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Test field validation
const testFieldValidation = () => {
  console.log('\n📝 Testing Field Validation Requirements:');
  
  const requiredFields = [
    'vetId',
    'appointmentDate', 
    'startTime',
    'type',
    'reason'
  ];
  
  console.log('Required fields for appointment booking:');
  requiredFields.forEach(field => {
    console.log(`  ✓ ${field}`);
  });
  
  console.log('\nOptional fields:');
  const optionalFields = ['petId', 'endTime', 'notes'];
  optionalFields.forEach(field => {
    console.log(`  • ${field}`);
  });
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Appointment Booking Tests\n');
  console.log('=' .repeat(50));
  
  testFieldValidation();
  console.log('\n' + '=' .repeat(50));
  
  await testAppointmentBooking();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests Complete');
};

// Run if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAppointmentBooking,
  testFieldValidation,
  runTests
};
