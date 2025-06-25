/**
 * Test API Endpoints
 * Test the appointment booking without session (to check field validation)
 */

const testAppointmentValidation = async () => {
  console.log('🧪 Testing Appointment API Field Validation...\n');
  
  // Test with valid data structure
  const testData = {
    vetId: '685b0cc19b2e577589a6a669', // Real vet ID from debug
    petId: '684fe6e0842b301df7fa061d', // Real pet ID from debug
    appointmentDate: '2025-06-26',
    startTime: '10:00',
    endTime: '11:00',
    type: 'Consultation',
    reason: 'Regular checkup',
    notes: 'Test appointment'
  };
  
  console.log('📋 Sending test data:');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log(`\n📡 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(result, null, 2));
    
    if (response.status === 401) {
      console.log('\n✅ EXPECTED: Authentication required (401) - Good!');
    } else if (response.status === 400) {
      console.log('\n❌ VALIDATION ERROR: Check required fields');
    } else {
      console.log('\n🎯 Unexpected response - check API logic');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Test GET appointments
const testGetAppointments = async () => {
  console.log('\n🔍 Testing GET Appointments...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/appointments');
    const result = await response.json();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Test GET veterinarians
const testGetVeterinarians = async () => {
  console.log('\n👨‍⚕️ Testing GET Veterinarians...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/veterinarians');
    const result = await response.json();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📋 Found ${result.data?.length || 0} veterinarians`);
    
    if (result.data?.length > 0) {
      console.log('First veterinarian:');
      const firstVet = result.data[0];
      console.log(`  - ID: ${firstVet._id}`);
      console.log(`  - Available: ${firstVet.isAvailable}`);
      console.log(`  - Fee: $${firstVet.consultationFee}`);
      console.log(`  - Specializations: ${firstVet.specializations?.join(', ') || 'None'}`);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Test GET pets
const testGetPets = async () => {
  console.log('\n🐾 Testing GET Pets...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/pets');
    const result = await response.json();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📋 Found ${result.data?.length || 0} pets`);
    
    if (result.data?.length > 0) {
      console.log('First pet:');
      const firstPet = result.data[0];
      console.log(`  - ID: ${firstPet._id}`);
      console.log(`  - Name: ${firstPet.name}`);
      console.log(`  - Species: ${firstPet.species}`);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Main test runner
const runAPITests = async () => {
  console.log('🚀 Starting API Tests');
  console.log('=' .repeat(60));
  
  await testGetVeterinarians();
  await testGetPets();
  await testGetAppointments();
  await testAppointmentValidation();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✨ API Tests Complete');
};

// Run tests
runAPITests().catch(console.error);
