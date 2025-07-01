'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  LogOut,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  Activity,
  AlertCircle,
  CheckCircle
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
  upcomingAppointments: number;
  completedAppointments: number;
  totalAppointments: number;
  completionRate: number;
  monthlyRevenue: number;
  patientGrowth: number;
  efficiency: number;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason: string;
  notes?: string;
  type: string;
  duration?: number;
  pet: {
    name: string;
    species: string;
    breed: string;
    age: number;
  };
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  clinic?: {
    name: string;
    location: string;
  };
}

interface Patient {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight?: number;
  color?: string;
  gender: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  appointmentCount: number;
  lastAppointment?: {
    appointmentDate: string;
    status: string;
  };
  nextAppointment?: {
    appointmentDate: string;
    status: string;
  };
}

export default function VetDashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'schedule' | 'records'>('appointments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState<VetStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    pendingRecords: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalAppointments: 0,
    completionRate: 0,
    monthlyRevenue: 0,
    patientGrowth: 0,
    efficiency: 0
  });

  // Tab-specific data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
  const fetchTabData = useCallback(async () => {
    try {
      if (activeTab === 'appointments') {
        console.log('🔍 Fetching appointments...');
        const response = await fetch('/api/vet/appointments');
        console.log('📊 Appointments response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📋 Appointments data:', data);
          
          // Debug: Check the structure of the first appointment
          if (data.data && data.data.length > 0) {
            const firstAppointment = data.data[0];
            console.log('🔍 First appointment structure:', {
              id: firstAppointment._id,
              pet: firstAppointment.pet,
              owner: firstAppointment.owner,
              hasOwner: !!firstAppointment.owner,
              ownerName: firstAppointment.owner?.name || 'Missing'
            });
          }
          
          setAppointments(data.data || data || []);
        } else {
          const errorData = await response.text();
          console.error('❌ Appointments error:', errorData);
        }
      } else if (activeTab === 'patients') {
        console.log('🔍 Fetching patients...');
        const response = await fetch('/api/vet/patients');
        console.log('📊 Patients response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('👥 Patients data:', data);
          setPatients(data.data || data || []);
        } else {
          const errorData = await response.text();
          console.error('❌ Patients error:', errorData);
        }
      }
    } catch (error) {
      console.error('Error fetching tab data:', error);
    }
  }, [activeTab]);

  const fetchVetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏥 Fetching vet stats...');
      // Fetch vet stats
      const statsResponse = await fetch('/api/vet/stats');
      console.log('📊 Stats response:', statsResponse.status, statsResponse.statusText);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📈 Stats data:', statsData);
        setStats(statsData);
      } else {
        const errorData = await statsResponse.text();
        console.error('❌ Stats error:', errorData);
        throw new Error('Failed to fetch stats');
      }

      // Fetch appointments based on active tab
      await fetchTabData();
    } catch (error) {
      console.error('Error fetching vet data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchTabData]);

  useEffect(() => {
    if (session?.user?.role === 'Vet') {
      fetchVetData();
    }
  }, [session, fetchVetData]);

  // Fetch data when tab changes
  useEffect(() => {
    if (session?.user?.role === 'Vet' && !loading) {
      fetchTabData();
    }
  }, [activeTab, session, loading, fetchTabData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVetData();
    setRefreshing(false);
  };

  const handleStatsCardClick = (cardType: string) => {
    switch (cardType) {
      case 'appointments':
        setActiveTab('appointments');
        setAppointmentFilter('all');
        break;
      case 'patients':
        setActiveTab('patients');
        break;
      case 'pending':
        setActiveTab('records');
        break;
      default:
        break;
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
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
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
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
                  title: 'Today\'s Appointments',
                  value: stats.todayAppointments,
                  icon: Calendar,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50',
                  clickAction: () => handleStatsCardClick('appointments')
                },
                {
                  title: 'This Week',
                  value: stats.weekAppointments,
                  icon: TrendingUp,
                  color: 'from-emerald-500 to-teal-500',
                  bgColor: 'from-emerald-50 to-teal-50',
                  clickAction: () => handleStatsCardClick('appointments')
                },
                {
                  title: 'Total Patients',
                  value: stats.totalPatients,
                  icon: Users,
                  color: 'from-purple-500 to-indigo-500',
                  bgColor: 'from-purple-50 to-indigo-50',
                  clickAction: () => handleStatsCardClick('patients')
                },
                {
                  title: 'Pending Records',
                  value: stats.pendingRecords,
                  icon: FileText,
                  color: 'from-rose-500 to-pink-500',
                  bgColor: 'from-rose-50 to-pink-50',
                  clickAction: () => handleStatsCardClick('pending')
                }
              ].map((stat, index) => (
                <button
                  key={index}
                  onClick={stat.clickAction}
                  className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 text-left w-full group`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium group-hover:text-slate-700 transition-colors">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1 group-hover:scale-105 transition-transform">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Appointments Management */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Appointments</h3>
                <div className="flex space-x-3">
                  {/* Filter Buttons */}
                  <div className="flex space-x-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setAppointmentFilter(filter.value as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          appointmentFilter === filter.value
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow text-sm">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Note
                  </button>
                </div>
              </div>

              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments
                    .filter(appointment => {
                      if (appointmentFilter !== 'all' && appointment.status.toLowerCase() !== appointmentFilter) return false;
                      if (searchTerm && !appointment.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
                          !appointment.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                      return true;
                    })
                    .map((appointment) => (
                      <div
                        key={appointment._id}
                        className="bg-white/80 rounded-xl p-4 border border-slate-200/40 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                appointment.status === 'confirmed' ? 'bg-emerald-500' :
                                appointment.status === 'pending' ? 'bg-yellow-500' :
                                appointment.status === 'completed' ? 'bg-blue-500' :
                                'bg-slate-400'
                              }`}></div>
                              <h4 className="font-medium text-slate-800">{appointment.pet?.name || 'Unknown Pet'}</h4>
                              <span className="text-sm text-slate-500">({appointment.owner?.name || 'Unknown Owner'})</span>
                              <span className="text-xs text-slate-400">{appointment.pet?.species || 'Unknown'} • {appointment.pet?.breed || 'Unknown'}</span>
                            </div>
                            <div className="ml-5 mt-1">
                              <p className="text-sm text-slate-600">{appointment.reason || appointment.type}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                              </p>
                              {appointment.notes && (
                                <p className="text-xs text-slate-500 mt-1">Note: {appointment.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' 
                                ? 'bg-emerald-100 text-emerald-700'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : appointment.status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {appointment.status}
                            </span>
                            <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-slate-400 hover:text-blue-600 transition-colors">
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No appointments found</p>
                  <p className="text-sm text-slate-500 mt-2">Appointments will appear here when scheduled.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patients tab */}
        {activeTab === 'patients' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Patient Management</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                  <Plus className="h-4 w-4 inline mr-2" />
                  New Patient
                </button>
              </div>
            </div>

            {patients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients
                  .filter(patient => 
                    !searchTerm || 
                    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patient.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((patient) => (
                    <div
                      key={patient._id}
                      className="bg-white/80 rounded-xl p-4 border border-slate-200/40 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-slate-800">{patient.name || 'Unknown Pet'}</h4>
                          <p className="text-sm text-slate-600">{patient.species || 'Unknown'} • {patient.breed || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{patient.age || 'Unknown'} years old • {patient.gender || 'Unknown'}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Owner:</span>
                          <span className="text-slate-700">{patient.owner?.name || 'Unknown Owner'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Appointments:</span>
                          <span className="text-slate-700">{patient.appointmentCount || 0}</span>
                        </div>
                        {patient.lastAppointment && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Last visit:</span>
                            <span className="text-slate-700">
                              {new Date(patient.lastAppointment.appointmentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {patient.nextAppointment && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Next visit:</span>
                            <span className="text-emerald-600 font-medium">
                              {new Date(patient.nextAppointment.appointmentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          {patient.owner?.phone && `📞 ${patient.owner.phone}`}
                        </span>
                        <button className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full hover:bg-emerald-100 transition-colors">
                          View Records
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No patients found</p>
                <p className="text-sm text-slate-500 mt-2">Patient records will appear here when you have appointments.</p>
              </div>
            )}
          </div>
        )}

        {/* Schedule tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Schedule Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Today&apos;s Schedule</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.todayAppointments} appointments</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completion Rate</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.completionRate}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Efficiency Score</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.efficiency}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Schedule Management</h3>
                <div className="flex space-x-3">
                  <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    View Calendar
                  </button>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Block Time
                  </button>
                </div>
              </div>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Schedule management interface coming soon...</p>
                <p className="text-sm text-slate-500 mt-2">Manage availability, time slots, and schedule preferences.</p>
              </div>
            </div>
          </div>
        )}

        {/* Records tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Records Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Pending Records</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.pendingRecords}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-rose-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed Today</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {Math.max(0, stats.todayAppointments - stats.pendingRecords)}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Records</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.completedAppointments}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Medical Records</h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search records..."
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                    <Plus className="h-4 w-4 inline mr-2" />
                    New Record
                  </button>
                </div>
              </div>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Medical records interface coming soon...</p>
                <p className="text-sm text-slate-500 mt-2">Create, edit, and manage patient medical records and histories.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
