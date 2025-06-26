'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Stethoscope, 
  Heart, 
  LogOut, 
  Shield, 
  Calendar, 
  Users, 
  Plus,
  Clock,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react';

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

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight?: number;
  color?: string;
  gender: 'Male' | 'Female';
  allergies?: string[];
  notes?: string;
  profileImage?: string;
  createdAt: string;
  ownerId: string;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  reason: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  totalAmount: number;
  paymentStatus: string;
  petId: Pet;
  vetId: {
    _id: string;
    licenseNumber: string;
    specializations: string[];
    consultationFee: number;
    userId: {
      name: string;
      email: string;
    };
  };
}

interface Veterinarian {
  _id: string;
  licenseNumber: string;
  specializations: string[];
  experience: number;
  consultationFee: number;
  rating: number;
  bio?: string;
  isAvailable: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<'pets' | 'appointments'>('pets');
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Form states
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: 1,
    weight: '',
    color: '',
    gender: 'Male' as 'Male' | 'Female',
    allergies: '',
    notes: ''
  });

  const [bookingForm, setBookingForm] = useState({
    petId: '',
    vetId: '',
    appointmentDate: '',
    startTime: '',
    type: 'Consultation',
    reason: '',
    notes: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch pets
        const petsResponse = await fetch('/api/pets');
        const petsData = await petsResponse.json();
        console.log('🐾 Frontend: Pets API response:', petsData);
        if (petsData.success) {
          console.log('🐾 Frontend: Setting pets data:', petsData.data);
          console.log('🐾 Frontend: Number of pets:', petsData.data.length);
          setPets(petsData.data);
        } else {
          console.error('🐾 Frontend: Failed to fetch pets:', petsData.error);
        }

        // Fetch appointments
        const appointmentsResponse = await fetch('/api/appointments');
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsData.success) {
          console.log('📅 Appointments API response:', appointmentsData.data.length, 'appointments');
          setAppointments(appointmentsData.data);
        } else {
          console.error('📅 Failed to fetch appointments:', appointmentsData.error);
        }

        // Fetch veterinarians
        const vetsResponse = await fetch('/api/veterinarians');
        const vetsData = await vetsResponse.json();
        if (vetsData.success) {
          setVeterinarians(vetsData.data);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user]);

  // Pet management functions
  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const petData = {
        ...petForm,
        age: Number(petForm.age),
        weight: petForm.weight ? Number(petForm.weight) : undefined,
        allergies: petForm.allergies ? petForm.allergies.split(',').map(a => a.trim()) : []
      };

      console.log('🐾 Submitting pet data:', petData); // Debug log

      const url = editingPet ? `/api/pets/${editingPet._id}` : '/api/pets';
      const method = editingPet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petData)
      });

      const result = await response.json();
      console.log('📡 Pet creation response:', response.status, result); // Debug log
      
      if (result.success) {
        console.log('✅ Pet created successfully, refreshing list...'); // Debug log
        // Refresh pets
        const petsResponse = await fetch('/api/pets');
        const petsData = await petsResponse.json();
        console.log('📋 Refreshed pets data:', petsData); // Debug log
        if (petsData.success) {
          setPets(petsData.data);
        }
        
        setShowPetModal(false);
        setEditingPet(null);
        resetPetForm();
      } else {
        console.error('❌ Pet creation failed:', result.error);
        alert(`Failed to create pet: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('An error occurred while saving the pet. Please try again.');
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (confirm('Are you sure you want to delete this pet?')) {
      try {
        const response = await fetch(`/api/pets/${petId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setPets(pets.filter(pet => pet._id !== petId));
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const resetPetForm = () => {
    setPetForm({
      name: '',
      species: 'Dog',
      breed: '',
      age: 1,
      weight: '',
      color: '',
      gender: 'Male',
      allergies: '',
      notes: ''
    });
  };

  const openEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age,
      weight: pet.weight?.toString() || '',
      color: pet.color || '',
      gender: pet.gender,
      allergies: pet.allergies?.join(', ') || '',
      notes: pet.notes || ''
    });
    setShowPetModal(true);
  };

  // Appointment management functions
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          endTime: calculateEndTime(bookingForm.startTime)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh appointments
        const appointmentsResponse = await fetch('/api/appointments');
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsData.success) {
          setAppointments(appointmentsData.data);
        }
        
        setShowBookingModal(false);
        resetBookingForm();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + 1;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Check if a time slot is occupied for the selected vet and date
  const isTimeSlotOccupied = (time: string) => {
    if (!bookingForm.vetId || !bookingForm.appointmentDate) return false;
    
    return appointments.some(apt => 
      apt.vetId?._id === bookingForm.vetId &&
      apt.appointmentDate.split('T')[0] === bookingForm.appointmentDate &&
      apt.startTime === time &&
      ['Scheduled', 'Confirmed'].includes(apt.status)
    );
  };

  // Get available time slots
  const getAvailableTimeSlots = () => {
    const allSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    return allSlots.map(time => ({
      time,
      occupied: isTimeSlotOccupied(time)
    }));
  };

  const resetBookingForm = () => {
    setBookingForm({
      petId: '',
      vetId: '',
      appointmentDate: '',
      startTime: '',
      type: 'Consultation',
      reason: '',
      notes: ''
    });
    setSelectedDate(null);
  };

  // Filter appointments
  const today = new Date();
  const upcomingAppointments = appointments.filter(apt => 
    apt && apt._id && new Date(apt.appointmentDate) >= today
  );
  const pastAppointments = appointments.filter(apt => 
    apt && apt._id && new Date(apt.appointmentDate) < today
  );

  // Pets are already filtered by the API to only include the current user's pets
  const visiblePets = pets.filter(pet => pet._id);
  
  console.log('🐾 Frontend: pets state:', pets.length);
  console.log('🐾 Frontend: Raw pets data:', pets);
  console.log('🐾 Frontend: visiblePets after filtering:', visiblePets.length);
  if (pets.length > 0) {
    console.log('🐾 Frontend: First pet structure:', pets[0]);
    console.log('🐾 Frontend: First pet _id:', pets[0]._id, 'Type:', typeof pets[0]._id);
  }

  const displayedAppointments = showPastAppointments ? pastAppointments : upcomingAppointments;
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <Stethoscope className="h-12 w-12 text-emerald-600 mx-auto animate-pulse" />
            <Heart className="h-4 w-4 text-teal-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Stethoscope className="h-8 w-8 text-emerald-600" />
                <Heart className="h-3 w-3 text-teal-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                VetCare Pro
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-slate-700">
                Welcome back, <span className="font-semibold text-slate-900">{session.user?.name}</span>
                {session.user?.role && (
                  <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
                    <Shield className="w-3 h-3 mr-1" />
                    {session.user.role}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 mb-8">
            <div className="border-b border-emerald-100">
              <nav className="flex space-x-8 px-8 pt-6">
                <button
                  onClick={() => setActiveTab('pets')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'pets'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  My Pets ({visiblePets.length})
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'appointments'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Appointments ({upcomingAppointments.length} upcoming)
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Pets Tab */}
              {activeTab === 'pets' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">My Pets</h2>
                    <button
                      onClick={() => {
                        resetPetForm();
                        setEditingPet(null);
                        setShowPetModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Pet
                    </button>
                  </div>

                  {visiblePets.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No pets yet</h3>
                      <p className="text-slate-600 mb-6">Get started by adding your first pet</p>
                      <button
                        onClick={() => {
                          resetPetForm();
                          setEditingPet(null);
                          setShowPetModal(true);
                        }}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Pet
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {visiblePets.map((pet) => (
                        <div key={pet._id.toString()} className="bg-white rounded-xl shadow-md border border-emerald-100 p-6 hover:shadow-lg transition-all duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">{pet.name}</h3>
                              <p className="text-sm text-slate-600">{pet.species} • {pet.breed}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditPet(pet)}
                                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePet(pet._id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Age:</span>
                              <span className="font-medium">{pet.age} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Gender:</span>
                              <span className="font-medium">{pet.gender}</span>
                            </div>
                            {pet.weight && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Weight:</span>
                                <span className="font-medium">{pet.weight} kg</span>
                              </div>
                            )}
                            {pet.color && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Color:</span>
                                <span className="font-medium">{pet.color}</span>
                              </div>
                            )}
                          </div>
                          
                          {pet.allergies && pet.allergies.length > 0 && (
                            <div className="mt-4">
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                                Allergies: {pet.allergies.join(', ')}
                              </span>
                            </div>
                          )}
                          
                          {pet.notes && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-600">{pet.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
                      <button
                        onClick={() => setShowPastAppointments(!showPastAppointments)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          showPastAppointments
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {showPastAppointments ? 'Past' : 'Upcoming'}
                      </button>
                    </div>
                    
                    {pets.length > 0 && (
                      <button
                        onClick={() => {
                          resetBookingForm();
                          setShowBookingModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </button>
                    )}
                  </div>

                  {displayedAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {showPastAppointments ? 'No past appointments' : 'No upcoming appointments'}
                      </h3>
                      <p className="text-slate-600 mb-6">
                        {showPastAppointments 
                          ? 'Your appointment history will appear here'
                          : pets.length === 0
                          ? 'Add a pet first, then book your first appointment'
                          : 'Book your first appointment with our veterinarians'
                        }
                      </p>
                      {!showPastAppointments && pets.length > 0 && (
                        <button
                          onClick={() => {
                            resetBookingForm();
                            setShowBookingModal(true);
                          }}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Book Your First Appointment
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayedAppointments.map((appointment) => (
                        <div key={`appointment-${appointment._id}`} className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {appointment.type} - {appointment.petId?.name || 'No pet selected'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-600 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-slate-600 mb-1">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    {appointment.startTime} - {appointment.endTime}
                                  </p>
                                  <p className="text-slate-600">
                                    Dr. {appointment.vetId?.userId?.name || 'Unknown Vet'}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-slate-600 mb-1">
                                    <strong>Reason:</strong> {appointment.reason}
                                  </p>
                                  <p className="text-slate-600">
                                    <strong>Fee:</strong> ${appointment.totalAmount}
                                  </p>
                                </div>
                              </div>
                              
                              {appointment.diagnosis && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Diagnosis:</strong> {appointment.diagnosis}
                                  </p>
                                </div>
                              )}
                              
                              {appointment.treatment && (
                                <div className="mt-2 p-3 bg-emerald-50 rounded-lg">
                                  <p className="text-sm text-emerald-800">
                                    <strong>Treatment:</strong> {appointment.treatment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Pet Modal */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingPet ? 'Edit Pet' : 'Add New Pet'}
                </h3>
                <button
                  onClick={() => {
                    setShowPetModal(false);
                    setEditingPet(null);
                    resetPetForm();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handlePetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={petForm.name}
                    onChange={(e) => setPetForm({...petForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter pet name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Species *</label>
                    <select
                      required
                      value={petForm.species}
                      onChange={(e) => setPetForm({...petForm, species: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Hamster">Hamster</option>
                      <option value="Fish">Fish</option>
                      <option value="Reptile">Reptile</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                    <select
                      required
                      value={petForm.gender}
                      onChange={(e) => setPetForm({...petForm, gender: e.target.value as 'Male' | 'Female'})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Breed</label>
                  <input
                    type="text"
                    value={petForm.breed}
                    onChange={(e) => setPetForm({...petForm, breed: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter breed"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="50"
                      value={petForm.age}
                      onChange={(e) => setPetForm({...petForm, age: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={petForm.weight}
                      onChange={(e) => setPetForm({...petForm, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={petForm.color}
                      onChange={(e) => setPetForm({...petForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Brown"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allergies</label>
                  <input
                    type="text"
                    value={petForm.allergies}
                    onChange={(e) => setPetForm({...petForm, allergies: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Separate multiple allergies with commas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={petForm.notes}
                    onChange={(e) => setPetForm({...petForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    placeholder="Any additional notes about your pet"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPetModal(false);
                      setEditingPet(null);
                      resetPetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingPet ? 'Update Pet' : 'Add Pet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Book Appointment</h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    resetBookingForm();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Pet *</label>
                  <select
                    required
                    value={bookingForm.petId}
                    onChange={(e) => setBookingForm({...bookingForm, petId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Choose a pet</option>
                    {visiblePets.map((pet) => (
                      <option key={`pet-${pet._id}`} value={pet._id}>
                        {pet.name} ({pet.species})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Veterinarian *</label>
                  <select
                    required
                    value={bookingForm.vetId}
                    onChange={(e) => setBookingForm({...bookingForm, vetId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Choose a veterinarian</option>
                    {veterinarians
                      .filter(vet => vet.isAvailable && vet._id) // Ensure vet has valid _id
                      .map((vet, index) => (
                      <option key={`vet-${vet._id || `fallback-${index}`}`} value={vet._id}>
                        Dr. {vet.userId?.name || 'Unknown'} - ${vet.consultationFee || 0} ({Array.isArray(vet.specializations) ? vet.specializations.join(', ') : 'General'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => {
                        setSelectedDate(date);
                        setBookingForm({
                          ...bookingForm, 
                          appointmentDate: date ? date.toISOString().split('T')[0] : ''
                        });
                      }}
                      minDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select appointment date"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                    <select
                      required
                      value={bookingForm.startTime}
                      onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select time</option>
                      {getAvailableTimeSlots().map(({ time, occupied }) => (
                        <option 
                          key={`time-${time}`} 
                          value={time}
                          disabled={occupied}
                          style={{ color: occupied ? '#ccc' : 'inherit' }}
                        >
                          {time} {occupied ? '(Occupied)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Appointment Type *</label>
                  <select
                    required
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm({...bookingForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Checkup">Checkup</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit *</label>
                  <textarea
                    required
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({...bookingForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    placeholder="Describe the reason for this appointment"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={2}
                    placeholder="Any additional notes or special requests"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      resetBookingForm();
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
