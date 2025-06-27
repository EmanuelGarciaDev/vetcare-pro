'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Heart,
  FileText
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

interface AdminStats {
  totalUsers: number;
  totalVets: number;
  totalClinics: number;
  totalAppointments: number;
  monthlyRevenue: number;
}

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason: string;
  petId: {
    _id: string;
    name: string;
    ownerId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  clinicId: {
    _id: string;
    name: string;
    location: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vets' | 'clinics' | 'pets' | 'appointments'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVets: 0,
    totalClinics: 0,
    totalAppointments: 0,
    monthlyRevenue: 0
  });
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Auth and role check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'Admin') {
      // Redirect non-admin users to their appropriate dashboard
      if (session?.user?.role === 'Vet') {
        router.push('/vet');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Fetch admin stats
  useEffect(() => {
    if (session?.user?.role === 'Admin') {
      fetchAdminStats();
    }
  }, [session]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async () => {
    try {
      setPetsLoading(true);
      const response = await fetch('/api/admin/pets');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPets(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setPetsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const response = await fetch('/api/admin/appointments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppointments(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'Admin') {
    return null; // Auth redirect will handle this
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-emerald-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  VetCare Pro Admin
                </h1>
                <p className="text-xs text-slate-500">System Administration</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">{session.user.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
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
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'vets', label: 'Veterinarians', icon: Shield },
              { id: 'clinics', label: 'Clinics', icon: Building2 },
              { id: 'pets', label: 'Pets', icon: Heart },
              { id: 'appointments', label: 'Appointments', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as 'overview' | 'users' | 'vets' | 'clinics' | 'pets' | 'appointments');
                  if (id === 'pets' && pets.length === 0) {
                    fetchPets();
                  } else if (id === 'appointments' && appointments.length === 0) {
                    fetchAppointments();
                  }
                }}
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Users',
                  value: stats.totalUsers,
                  icon: Users,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50'
                },
                {
                  title: 'Veterinarians',
                  value: stats.totalVets,
                  icon: Shield,
                  color: 'from-emerald-500 to-teal-500',
                  bgColor: 'from-emerald-50 to-teal-50'
                },
                {
                  title: 'Clinics',
                  value: stats.totalClinics,
                  icon: Building2,
                  color: 'from-purple-500 to-indigo-500',
                  bgColor: 'from-purple-50 to-indigo-50'
                },
                {
                  title: 'Appointments',
                  value: stats.totalAppointments,
                  icon: Calendar,
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

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Add New Vet',
                    description: 'Create veterinarian profile',
                    icon: Plus,
                    action: () => setActiveTab('vets')
                  },
                  {
                    title: 'Manage Clinics',
                    description: 'Add or edit clinic locations',
                    icon: Building2,
                    action: () => setActiveTab('clinics')
                  },
                  {
                    title: 'System Settings',
                    description: 'Configure system parameters',
                    icon: Settings,
                    action: () => console.log('Settings clicked')
                  }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-left p-4 rounded-xl border-2 border-slate-200/60 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">{action.title}</h4>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 inline mr-2" />
                Add User
              </button>
            </div>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">User management interface coming soon...</p>
              <p className="text-sm text-slate-500 mt-2">This will include user CRUD operations, role management, and activity monitoring.</p>
            </div>
          </div>
        )}

        {activeTab === 'vets' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Veterinarian Management</h3>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 inline mr-2" />
                Add Veterinarian
              </button>
            </div>
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Veterinarian management interface coming soon...</p>
              <p className="text-sm text-slate-500 mt-2">This will include vet profiles, specializations, schedules, and performance metrics.</p>
            </div>
          </div>
        )}

        {activeTab === 'clinics' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Clinic Management</h3>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 inline mr-2" />
                Add Clinic
              </button>
            </div>
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Clinic management interface coming soon...</p>
              <p className="text-sm text-slate-500 mt-2">This will include clinic locations, facilities, staff assignments, and operational hours.</p>
            </div>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Pet Management</h3>
              <div className="text-sm text-slate-600">
                Total Pets: <span className="font-semibold text-emerald-600">{pets.length}</span>
              </div>
            </div>
            
            {petsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading pets...</p>
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No pets found in the system.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <div key={pet._id} className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-800">{pet.name}</h4>
                          <p className="text-sm text-slate-600">{pet.species} • {pet.breed}</p>
                          <p className="text-xs text-slate-500">Age: {pet.age} years</p>
                        </div>
                        <Heart className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-sm font-medium text-slate-700">Owner:</p>
                        <p className="text-sm text-slate-600">{pet.ownerId.firstName} {pet.ownerId.lastName}</p>
                        <p className="text-xs text-slate-500">{pet.ownerId.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Appointments Management</h3>
              <div className="text-sm text-slate-600">
                Total Appointments: <span className="font-semibold text-emerald-600">{appointments.length}</span>
              </div>
            </div>
            
            {appointmentsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No appointments found in the system.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pet & Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Clinic</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {appointments.slice(0, 20).map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{appointment.petId.name}</p>
                              <p className="text-sm text-slate-500">{appointment.petId.ownerId.firstName} {appointment.petId.ownerId.lastName}</p>
                              <p className="text-xs text-slate-400">{appointment.petId.ownerId.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm text-slate-900">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                              <p className="text-sm text-slate-500">{appointment.appointmentTime}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm text-slate-900">{appointment.clinicId.name}</p>
                              <p className="text-xs text-slate-500">{appointment.clinicId.location}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-slate-900">{appointment.reason}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {appointments.length > 20 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-slate-500">Showing first 20 appointments of {appointments.length}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
