'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Stethoscope, Heart, ArrowLeft, User, Star, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface Veterinarian {
  _id: string;
  userId: {
    name: string;
    email: string;
    image?: string;
  };
  specializations: string[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  experience: number;
  availableSlots?: string[];
  workingHours?: {
    start: string;
    end: string;
  };
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string;
}

export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [selectedDate, setSelectedDate] = useState('');  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);  const [isLoadingSlots, setIsLoadingSlots] = useState(false);  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchVeterinarians = useCallback(async () => {
    try {
      setNetworkError(false);
      const response = await fetch('/api/veterinarians');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setVeterinarians(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch veterinarians');
      }
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      setNetworkError(true);
    }
  }, []);

  useEffect(() => {
    fetchVeterinarians();
  }, [fetchVeterinarians]);const fetchBookedAppointments = async (date: string, vetId?: string): Promise<string[]> => {
    try {
      const params = new URLSearchParams({ date });
      if (vetId) params.append('veterinarianId', vetId);
      
      const response = await fetch(`/api/appointments/availability?${params}`);
      const data = await response.json();
      if (data.success) {
        return data.data.map((slot: { time: string }) => slot.time);
      }
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
    }
    return [];
  };

  const generateTimeSlots = (startTime: string, endTime: string, bookedSlots: string[] = []): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    for (let time = start; time < end; time += 30) {
      const timeString = formatTime(time);
      const isBooked = bookedSlots.includes(timeString);
      
      slots.push({
        time: timeString,
        isAvailable: !isBooked,
        isBooked: isBooked,
        bookedBy: isBooked ? 'Another client' : undefined
      });
    }
    
    return slots;
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };  const fetchAvailableSlots = async (vetId: string, date: string) => {
    setIsLoadingSlots(true);
    try {
      // Get veterinarian's working hours
      const vetResponse = await fetch(`/api/veterinarians?date=${date}`);
      const vetData = await vetResponse.json();
      
      if (vetData.success) {
        const vet = vetData.data.find((v: Veterinarian) => v._id === vetId);
        if (vet && vet.workingHours) {
          // Get booked appointments for this date and veterinarian
          const bookedSlots = await fetchBookedAppointments(date, vetId);

          // Generate time slots with availability info
          const slots = generateTimeSlots(
            vet.workingHours.start, 
            vet.workingHours.end, 
            bookedSlots
          );
          
          setTimeSlots(slots);
          setSelectedVet(vet);
        }
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setTimeSlots([]);
    if (selectedVet && date) {
      fetchAvailableSlots(selectedVet._id, date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVet || !selectedDate || !selectedTime || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          veterinarianId: selectedVet._id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          reason,
          notes,
        }),
      });

      const data = await response.json();      if (data.success) {
        setSuccess('Appointment booked successfully!');
        // Redirect to success page with appointment details
        const params = new URLSearchParams({
          vetName: selectedVet.userId.name,
          date: selectedDate,
          time: selectedTime,
          reason: reason,
          fee: selectedVet.consultationFee.toString()
        });
        setTimeout(() => {
          router.push(`/booking/success?${params.toString()}`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to book appointment');
      }} catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  const handleRetry = useCallback(() => {
    setNetworkError(false);
    fetchVeterinarians();
  }, [fetchVeterinarians]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <Stethoscope className="h-12 w-12 text-emerald-600 mx-auto animate-pulse" />
            <Heart className="h-4 w-4 text-teal-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
            Book an Appointment
          </h1>
          <p className="text-lg text-slate-600">
            Schedule a consultation with our expert veterinarians
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8">          {/* Step 1: Enhanced Veterinarian Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose a Veterinarian</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {veterinarians.map((vet) => (
                  <div
                    key={vet._id}
                    onClick={() => {
                      setSelectedVet(vet);
                      setStep(2);
                    }}
                    className="group border-2 border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        {vet.userId.image ? (
                          <Image
                            src={vet.userId.image}
                            alt={vet.userId.name}
                            width={64}
                            height={64}
                            className="rounded-full group-hover:shadow-lg transition-shadow duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors duration-300">
                            <User className="w-8 h-8 text-emerald-600" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors duration-200">
                          Dr. {vet.userId.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(vet.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-slate-600">
                            {vet.rating.toFixed(1)} ({vet.reviewCount} reviews)
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {vet.experience} years experience
                        </p>
                        <div className="flex items-center mt-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-600">
                            ${vet.consultationFee} consultation
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {vet.specializations.slice(0, 2).map((spec) => (
                              <span
                                key={spec}
                                className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md group-hover:bg-emerald-200 transition-colors duration-200"
                              >
                                {spec}
                              </span>
                            ))}
                            {vet.specializations.length > 2 && (
                              <span className="text-xs text-slate-500 flex items-center">
                                +{vet.specializations.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover indicator */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex items-center text-sm text-emerald-600 font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Click to select
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {veterinarians.length === 0 && (
                <div className="text-center py-12">
                  <Stethoscope className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Loading veterinarians...</p>
                </div>
              )}

              {/* Retry button for network error */}
              {networkError && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-red-600 font-medium mb-2">
                    Failed to load veterinarians. Please try again.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}{/* Step 2: Enhanced Date & Time Selection */}
          {step === 2 && selectedVet && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Date & Time</h2>
              
              {/* Selected Veterinarian Info */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  {selectedVet.userId.image ? (
                    <Image
                      src={selectedVet.userId.image}
                      alt={selectedVet.userId.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-emerald-800">Dr. {selectedVet.userId.name}</h3>
                    <p className="text-sm text-emerald-600">${selectedVet.consultationFee} consultation</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Choose Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                  
                  {selectedDate && (
                    <div className="mt-3 text-sm text-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-slate-300 rounded-full mr-2"></div>
                          <span>Booked</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span>Selected</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Available Times
                  </label>
                  
                  {selectedDate ? (
                    <div className="space-y-3">
                      {isLoadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                          <span className="ml-3 text-slate-600">Loading available times...</span>
                        </div>
                      ) : timeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2">
                          {timeSlots.map((slot) => (
                            <div key={slot.time} className="relative group">
                              <button
                                onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                                onMouseEnter={() => setHoveredSlot(slot.time)}
                                onMouseLeave={() => setHoveredSlot(null)}
                                disabled={!slot.isAvailable}                                className={`
                                  time-slot w-full px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-300 relative
                                  ${selectedTime === slot.time
                                    ? 'selected bg-blue-600 text-white border-blue-600 shadow-lg'
                                    : slot.isAvailable
                                    ? 'bg-white border-emerald-300 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md'
                                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                  }
                                  ${hoveredSlot === slot.time && slot.isAvailable ? 'ring-2 ring-emerald-300 ring-opacity-50' : ''}
                                `}
                              >
                                <div className="flex items-center justify-center">
                                  <span>{slot.time}</span>
                                  {selectedTime === slot.time && (
                                    <CheckCircle className="w-4 h-4 ml-1" />
                                  )}
                                  {slot.isBooked && (
                                    <XCircle className="w-3 h-3 ml-1" />
                                  )}
                                </div>
                              </button>
                              
                              {/* Tooltip */}
                              {hoveredSlot === slot.time && (
                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                                  <div className="flex items-center">
                                    {slot.isAvailable ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                                        Available
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3 h-3 mr-1 text-red-400" />
                                        {slot.bookedBy || 'Booked'}
                                      </>
                                    )}
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p>No available slots for this date</p>
                          <p className="text-sm">Please select a different date</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p>Please select a date first</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Time Summary */}
              {selectedTime && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">
                      Selected: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedTime}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {step === 3 && selectedVet && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Appointment Details</h2>
              
              {/* Appointment Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-emerald-800 mb-3">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Veterinarian:</span> Dr. {selectedVet.userId.name}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {selectedTime}</p>
                  <p><span className="font-medium">Consultation Fee:</span> ${selectedVet.consultationFee}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Visit *
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Routine checkup, Vaccination, Health concern"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Any additional information or concerns you'd like to share"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-700 font-medium">{success}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    Back
                  </button>                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </div>
                    ) : (
                      'Review & Book Appointment'
                    )}
                  </button>
                </div>
              </form>            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedVet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 modal-enter transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Your Appointment</h3>
              <p className="text-slate-600">Please review your appointment details</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  {selectedVet.userId.image ? (
                    <Image
                      src={selectedVet.userId.image}
                      alt={selectedVet.userId.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900">Dr. {selectedVet.userId.name}</h4>
                    <p className="text-sm text-slate-600">{selectedVet.specializations.join(', ')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Date:</span>
                    <p className="text-slate-900">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Time:</span>
                    <p className="text-slate-900">{selectedTime}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Duration:</span>
                    <p className="text-slate-900">30 minutes</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Fee:</span>
                    <p className="text-slate-900 font-semibold">${selectedVet.consultationFee}</p>
                  </div>
                </div>
                
                {reason && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="font-medium text-slate-700">Reason:</span>
                    <p className="text-slate-900">{reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                Cancel
              </button>              <button
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setShowConfirmModal(false);
                  const formEvent = new Event('submit') as unknown as React.FormEvent;
                  handleSubmit(formEvent);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
