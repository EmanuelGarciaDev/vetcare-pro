'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  LogOut,
  Plus,
  Search
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

interface VetStats {
  todayAppointments: number;
  weekAppointments: number;
  totalPatients: number;
  pendingRecords: number;
}

interface Appointment {
  _id: string;
  petName: string;
  ownerName: string;
  appointmentDate: string;
  startTime: string;
  type: string;
  status: string;
}

export default function VetDashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'schedule' | 'records'>('appointments');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VetStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    pendingRecords: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  // Auth and role check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'Vet') {
      // Redirect non-vet users to their appropriate dashboard
      if (session?.user?.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Fetch vet stats and appointments
  useEffect(() => {
    if (session?.user?.role === 'Vet') {
      fetchVetData();
    }
  }, [session]);

  const fetchVetData = async () => {
    try {
      setLoading(true);
      
      // Fetch vet stats
      const statsResponse = await fetch('/api/vet/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch today's appointments
      const appointmentsResponse = await fetch('/api/vet/appointments/today');
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setTodayAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching vet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading veterinarian dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'Vet') {
    return null; // Auth redirect will handle this
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Stethoscope className="h-8 w-8 text-emerald-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  VetCare Pro
                </h1>
                <p className="text-xs text-slate-500">Veterinarian Portal</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">Dr. {session.user.name}</p>
                <p className="text-xs text-slate-500">Veterinarian</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'schedule', label: 'Schedule', icon: Clock },
              { id: 'records', label: 'Records', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'appointments' | 'patients' | 'schedule' | 'records')}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Today&apos;s Appointments',
                  value: stats.todayAppointments,
                  icon: Calendar,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50'
                },
                {
                  title: 'This Week',
                  value: stats.weekAppointments,
                  icon: TrendingUp,
                  color: 'from-emerald-500 to-teal-500',
                  bgColor: 'from-emerald-50 to-teal-50'
                },
                {
                  title: 'Total Patients',
                  value: stats.totalPatients,
                  icon: Users,
                  color: 'from-purple-500 to-indigo-500',
                  bgColor: 'from-purple-50 to-indigo-50'
                },
                {
                  title: 'Pending Records',
                  value: stats.pendingRecords,
                  icon: FileText,
                  color: 'from-rose-500 to-pink-500',
                  bgColor: 'from-rose-50 to-pink-50'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Appointments */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Today&apos;s Appointments</h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow text-sm">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Note
                  </button>
                </div>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white/80 rounded-xl p-4 border border-slate-200/40 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <h4 className="font-medium text-slate-800">{appointment.petName}</h4>
                            <span className="text-sm text-slate-500">({appointment.ownerName})</span>
                          </div>
                          <div className="ml-5 mt-1">
                            <p className="text-sm text-slate-600">{appointment.type}</p>
                            <p className="text-xs text-slate-500">{appointment.startTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'Confirmed' 
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {appointment.status}
                          </span>
                          <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No appointments scheduled for today</p>
                  <p className="text-sm text-slate-500 mt-2">Enjoy your light schedule!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs - placeholder content */}
        {activeTab === 'patients' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Patient Management</h3>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <Search className="h-4 w-4 inline mr-2" />
                Find Patient
              </button>
            </div>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Patient management interface coming soon...</p>
              <p className="text-sm text-slate-500 mt-2">Search, view, and manage patient records and history.</p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Schedule Management</h3>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 inline mr-2" />
                Block Time
              </button>
            </div>
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Schedule management interface coming soon...</p>
              <p className="text-sm text-slate-500 mt-2">Manage availability, time slots, and schedule preferences.</p>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Medical Records</h3>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 inline mr-2" />
                New Record
              </button>
            </div>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Medical records interface coming soon...</p>
              <p className="text-sm text-slate-500 mt-2">Create, edit, and manage patient medical records and histories.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
