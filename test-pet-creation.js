// Test script: test-pet-creation.js
// Purpose: Test pet creation for user2@example.com to debug the flow

const testPetCreation = async () => {
  console.log('🧪 Testing Pet Creation Flow...\n');
  
  // Test data for creating a pet
  const testPet = {
    name: 'TestPet',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 25,
    color: 'Golden',
    gender: 'Male',
    allergies: [],
    notes: 'Test pet for user2'
  };
  
  console.log('📋 Test pet data:');
  console.log(JSON.stringify(testPet, null, 2));
  console.log('\n');
  
  try {
    // Test the API endpoint (without session - should get 401)
    const response = await fetch('http://localhost:3000/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPet)
    });
    
    const responseData = await response.json();
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.status === 401) {
      console.log('\n✅ EXPECTED: Authentication required (401) - API is properly protected');
    } else if (response.status === 400) {
      console.log('\n❌ VALIDATION ERROR: Check required fields');
      if (responseData.error) {
        console.log(`Error: ${responseData.error}`);
      }
    } else {
      console.log('\n🎯 Unexpected response - check API logic');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// Test field validation
const testFieldValidation = () => {
  console.log('\n📝 Testing Field Validation Requirements:');
  
  const requiredFields = [
    'name',
    'species', 
    'gender'
  ];
  
  console.log('Required fields for pet creation:');
  requiredFields.forEach(field => {
    console.log(`  ✓ ${field}`);
  });
  
  console.log('\nOptional fields:');
  const optionalFields = ['breed', 'age', 'weight', 'color', 'allergies', 'notes'];
  optionalFields.forEach(field => {
    console.log(`  • ${field}`);
  });
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Pet Creation Tests\n');
  console.log('=' .repeat(50));
  
  testFieldValidation();
  console.log('\n' + '=' .repeat(50));
  
  await testPetCreation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests Complete');
  console.log('\n💡 To test with authentication:');
  console.log('1. Login as user2@example.com in the browser');
  console.log('2. Try to create a pet in the dashboard');
  console.log('3. Check browser console for any errors');
};

// Run if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testPetCreation,
  testFieldValidation,
  runTests
};
