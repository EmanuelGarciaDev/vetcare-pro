'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  Heart, 
  ArrowLeft, 
  User, 
  Star, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';

interface Appointment {
  _id: string;
  veterinarianId: {
    _id: string;
    userId: {
      name: string;
      email: string;
      image?: string;
    };
    specializations: string[];
    consultationFee: number;
    rating: number;
  };
  appointmentDate: string;
  reason: string;
  notes?: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  consultationFee: number;
  createdAt: string;
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data);
      } else {
        setError('Failed to fetch appointments');
      }    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Appointment cancelled successfully');
        fetchAppointments(); // Refresh the list
      } else {
        setError(data.error || 'Failed to cancel appointment');
      }    } catch {
      setError('Network error. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filterAppointments = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => 
          new Date(apt.appointmentDate) > now && apt.status !== 'Cancelled'
        );
      case 'past':
        return appointments.filter(apt => 
          new Date(apt.appointmentDate) < now || apt.status === 'Completed'
        );
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'Cancelled');
      default:
        return appointments;
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

  const filteredAppointments = filterAppointments();

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
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-2">
              My Appointments
            </h1>
            <p className="text-lg text-slate-600">
              Manage your veterinary appointments
            </p>
          </div>
          <button
            onClick={() => router.push('/booking')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Book New Appointment
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Appointments' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' },
              { key: 'cancelled', label: 'Cancelled' }            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'past' | 'cancelled')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-700 font-medium">{success}</p>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <Stethoscope className="h-8 w-8 text-emerald-600 animate-pulse" />
                <Heart className="h-3 w-3 text-teal-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <p className="mt-4 text-slate-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No appointments found</h3>
              <p className="text-slate-600 mb-6">
                {filter === 'all' 
                  ? "You haven't booked any appointments yet."
                  : `No ${filter} appointments found.`
                }
              </p>
              <button
                onClick={() => router.push('/booking')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      {/* Veterinarian Info */}
                      <div className="flex-shrink-0">
                        {appointment.veterinarianId.userId.image ? (
                          <img
                            src={appointment.veterinarianId.userId.image}
                            alt={appointment.veterinarianId.userId.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-emerald-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Dr. {appointment.veterinarianId.userId.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-slate-600">
                            {appointment.veterinarianId.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-slate-700">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-slate-700">
                          {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-slate-700">
                          ${appointment.consultationFee}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-slate-600 mt-1">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Specializations */}
                    <div className="flex flex-wrap gap-1">
                      {appointment.veterinarianId.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => router.push(`/appointments/${appointment._id}`)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    
                    {appointment.status === 'Scheduled' && (
                      <button
                        onClick={() => cancelAppointment(appointment._id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
