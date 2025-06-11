'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Stethoscope, Heart, ArrowLeft, User, Star, DollarSign } from 'lucide-react';
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

export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      const response = await fetch('/api/veterinarians');
      const data = await response.json();
      if (data.success) {
        setVeterinarians(data.data);
      }
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
    }
  };

  const fetchAvailableSlots = async (vetId: string, date: string) => {
    try {
      const response = await fetch(`/api/veterinarians?date=${date}`);
      const data = await response.json();
      if (data.success) {
        const vet = data.data.find((v: Veterinarian) => v._id === vetId);
        if (vet) {
          setSelectedVet(vet);
        }
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
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

      const data = await response.json();

      if (data.success) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to book appointment');
      }    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8">
          {/* Step 1: Select Veterinarian */}
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
                    className="border-2 border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                        {vet.userId.image ? (
                          <Image
                            src={vet.userId.image}
                            alt={vet.userId.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-emerald-600" />
                          </div>
                        )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Dr. {vet.userId.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-slate-600">
                            {vet.rating.toFixed(1)} ({vet.reviewCount} reviews)
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                          {vet.experience} years experience
                        </p>
                        <div className="flex items-center mt-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-600">
                            ${vet.consultationFee}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {vet.specializations.slice(0, 2).map((spec) => (
                              <span
                                key={spec}
                                className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md"
                              >
                                {spec}
                              </span>
                            ))}
                            {vet.specializations.length > 2 && (
                              <span className="text-xs text-slate-500">
                                +{vet.specializations.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && selectedVet && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Available Times
                  </label>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {selectedVet.availableSlots?.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                            selectedTime === slot
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          {slot}
                        </button>
                      )) || (
                        <p className="text-sm text-slate-500 col-span-3">
                          No available slots for this date
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Please select a date first</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Continue
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
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </div>
                    ) : (
                      'Book Appointment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
