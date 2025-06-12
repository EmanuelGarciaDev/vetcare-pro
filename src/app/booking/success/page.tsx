'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Stethoscope, Heart, CheckCircle, Calendar, Clock, User, DollarSign, Home } from 'lucide-react';

function BookingSuccessContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentData, setAppointmentData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Get appointment data from URL params
    const vetName = searchParams.get('vetName');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const reason = searchParams.get('reason');
    const fee = searchParams.get('fee');

    if (vetName && date && time && reason && fee) {
      setAppointmentData({
        vetName,
        date,
        time,
        reason,
        fee
      });
    }
  }, [searchParams]);

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
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8 text-center">
          {/* Success Animation */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto animate-ping opacity-25"></div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
            Appointment Booked Successfully! 🎉
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your appointment has been confirmed. You&apos;ll receive a confirmation email shortly.
          </p>

          {/* Appointment Details */}
          {appointmentData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-emerald-800 mb-4 text-center">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-slate-700">Veterinarian:</span>
                  <span className="ml-2 text-slate-900">Dr. {appointmentData.vetName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-slate-700">Date:</span>
                  <span className="ml-2 text-slate-900">
                    {new Date(appointmentData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-slate-700">Time:</span>
                  <span className="ml-2 text-slate-900">{appointmentData.time}</span>
                </div>
                <div className="flex items-center">
                  <Stethoscope className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-slate-700">Reason:</span>
                  <span className="ml-2 text-slate-900">{appointmentData.reason}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 mr-3" />
                  <span className="font-medium text-slate-700">Consultation Fee:</span>
                  <span className="ml-2 text-slate-900">${appointmentData.fee}</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-3">What&apos;s Next?</h3>
            <div className="text-sm text-blue-700 space-y-2 text-left">
              <p>• You&apos;ll receive a confirmation email within 5 minutes</p>
              <p>• Our team will contact you 24 hours before your appointment</p>
              <p>• Please arrive 15 minutes early for check-in</p>
              <p>• Bring any relevant medical records for your pet</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 inline mr-2" />
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/booking')}
              className="flex-1 sm:flex-none px-6 py-3 border border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all duration-200"
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Book Another Appointment
            </button>
          </div>

          {/* Emergency Contact */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Need to modify or cancel? Contact us at{' '}
              <a href="tel:+1-555-VET-CARE" className="text-emerald-600 hover:text-emerald-700 font-medium">
                +1-555-VET-CARE
              </a>
            </p>
          </div>        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <Stethoscope className="h-12 w-12 text-emerald-600 mx-auto animate-pulse" />
            <Heart className="h-4 w-4 text-teal-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
