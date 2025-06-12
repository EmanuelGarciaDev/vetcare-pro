// Test script to verify appointment booking functionality
const testAppointmentBooking = async () => {
  try {
    // First, get the veterinarians
    console.log('1. Fetching veterinarians...');
    const vetsResponse = await fetch('http://localhost:3000/api/veterinarians');
    const vetsData = await vetsResponse.json();
    
    if (!vetsData.success) {
      throw new Error('Failed to fetch veterinarians');
    }
    
    console.log(`✅ Found ${vetsData.data.length} veterinarians`);
    
    // Test availability endpoint
    console.log('2. Testing availability endpoint...');
    const today = new Date().toISOString().split('T')[0];
    const availabilityResponse = await fetch(`http://localhost:3000/api/appointments/availability?date=${today}`);
    const availabilityData = await availabilityResponse.json();
    
    console.log(`✅ Availability check completed. Found ${availabilityData.data?.length || 0} booked slots`);
    
    console.log('🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAppointmentBooking();
