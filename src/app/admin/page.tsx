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
  FileText,
  DollarSign,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight
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
  totalRevenue: number;
  todayAppointments: number;
  revenueGrowth: number;
  userGrowth: number;
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  emailVerified?: string;
  image?: string;
  petCount: number;
  appointmentCount: number;
  lastAppointment?: string;
  pets: Array<{
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
  }>;
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

interface Vet {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  emailVerified?: string;
  image?: string;
  appointmentCount: number;
  completedAppointments: number;
  pendingAppointments: number;
  lastAppointment?: string;
  specializations?: string[];
  licenseNumber?: string;
  experience?: number;
  consultationFee?: number;
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vets' | 'clinics' | 'pets' | 'appointments' | 'analytics' | 'revenue'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVets: 0,
    totalClinics: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    revenueGrowth: 0,
    userGrowth: 0
  });
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [vetsLoading, setVetsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showVetModal, setShowVetModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [vetModalMode, setVetModalMode] = useState<'create' | 'edit' | 'view'>('create');

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

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      console.log('Session status:', status);
      console.log('User role:', session?.user?.role);
      setUsersLoading(true);
      
      const response = await fetch('/api/admin/users');
      console.log('Users API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users API data:', data);
        if (data.success && data.data) {
          setUsers(data.data);
          console.log('Users set successfully:', data.data.length, 'users');
        } else {
          console.error('Users API returned unexpected format:', data);
          setUsers([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Users API error:', response.status, errorData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchVets = async () => {
    try {
      setVetsLoading(true);
      const response = await fetch('/api/admin/vets');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVets(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching vets:', error);
    } finally {
      setVetsLoading(false);
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
              { id: 'appointments', label: 'Appointments', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'revenue', label: 'Revenue', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as 'overview' | 'users' | 'vets' | 'clinics' | 'pets' | 'appointments' | 'analytics' | 'revenue');
                  if (id === 'pets' && pets.length === 0) {
                    fetchPets();
                  } else if (id === 'appointments' && appointments.length === 0) {
                    fetchAppointments();
                  } else if (id === 'users') {
                    fetchUsers(); // Always fetch users when tab is clicked
                  } else if (id === 'vets') {
                    fetchVets(); // Always fetch vets when tab is clicked
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
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Users',
                  value: stats.totalUsers,
                  icon: Users,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50',
                  growth: stats.userGrowth,
                  clickAction: () => setActiveTab('users')
                },
                {
                  title: 'Monthly Revenue',
                  value: `$${stats.monthlyRevenue.toLocaleString()}`,
                  icon: DollarSign,
                  color: 'from-emerald-500 to-teal-500',
                  bgColor: 'from-emerald-50 to-teal-50',
                  growth: stats.revenueGrowth,
                  clickAction: () => setActiveTab('revenue')
                },
                {
                  title: 'Total Appointments',
                  value: stats.totalAppointments,
                  icon: Calendar,
                  color: 'from-rose-500 to-pink-500',
                  bgColor: 'from-rose-50 to-pink-50',
                  subtext: `${stats.todayAppointments} today`,
                  clickAction: () => setActiveTab('appointments')
                },
                {
                  title: 'Active Clinics',
                  value: stats.totalClinics,
                  icon: Building2,
                  color: 'from-purple-500 to-indigo-500',
                  bgColor: 'from-purple-50 to-indigo-50',
                  subtext: `${stats.totalVets} vets`,
                  clickAction: () => setActiveTab('analytics')
                }
              ].map((stat, index) => (
                <button
                  key={index}
                  onClick={stat.clickAction}
                  className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left w-full group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                      {stat.subtext && (
                        <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
                      )}
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl group-hover:shadow-lg transition-shadow`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {stat.growth !== undefined && (
                    <div className="flex items-center space-x-2">
                      {stat.growth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-rose-600" />
                      )}
                      <span className={`text-sm font-medium ${stat.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {Math.abs(stat.growth)}% vs last month
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Click to view details</span>
                  </div>
                </button>
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
            {/* Debug Information */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p><strong>DEBUG:</strong> Users Array Length: {users.length}</p>
              <p><strong>Session Status:</strong> {status}</p>
              <p><strong>User Role:</strong> {session?.user?.role || 'None'}</p>
              <p><strong>Loading:</strong> {usersLoading ? 'Yes' : 'No'}</p>
              <button 
                onClick={fetchUsers}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Manual Fetch Users
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
                <p className="text-sm text-slate-600 mt-1">Manage users, monitor activity, and view pet ownership</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setUserModalMode('create');
                  setShowUserModal(true);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No users found in the system.</p>
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    setUserModalMode('create');
                    setShowUserModal(true);
                  }}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Create your first user
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Users Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <p className="text-blue-700 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-800">{users.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
                    <p className="text-emerald-700 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-emerald-800">{users.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl">
                    <p className="text-purple-700 text-sm font-medium">Pet Owners</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {users.filter(u => u.petCount > 0).length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl">
                    <p className="text-rose-700 text-sm font-medium">Admins</p>
                    <p className="text-2xl font-bold text-rose-800">
                      {users.filter(u => u.role === 'Admin').length}
                    </p>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pets</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Activity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {(user.name || 'Unknown User').split(' ').filter(n => n.length > 0).map(n => n.charAt(0)).join('').substring(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {user.name || 'Unknown User'}
                                </div>
                                <div className="text-sm text-slate-500">{user.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'Admin' 
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'Vet'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 text-emerald-500 mr-2" />
                              <span className="text-sm text-slate-900">{user.petCount} pets</span>
                              {user.pets.length > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setUserModalMode('view');
                                    setShowUserModal(true);
                                  }}
                                  className="ml-2 text-xs text-emerald-600 hover:text-emerald-800"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div>
                              <p>{user.appointmentCount} appointments</p>
                              {user.lastAppointment && (
                                <p className="text-xs">
                                  Last: {new Date(user.lastAppointment).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.emailVerified 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUserModalMode('view');
                                  setShowUserModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUserModalMode('edit');
                                  setShowUserModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vets' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Veterinarian Management</h3>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={fetchVets}
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Manual Fetch Vets
                </button>
                <button 
                  onClick={() => {
                    setSelectedVet(null);
                    setVetModalMode('create');
                    setShowVetModal(true);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Veterinarian</span>
                </button>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-slate-100 rounded-lg text-sm">
              <p><strong>Session Status:</strong> {status}</p>
              <p><strong>User Role:</strong> {session?.user?.role || 'Not set'}</p>
              <p><strong>Vets Array Length:</strong> {vets.length}</p>
              <p><strong>Vets Loading:</strong> {vetsLoading ? 'Yes' : 'No'}</p>
            </div>

            {vetsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading veterinarians...</p>
              </div>
            ) : vets.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No veterinarians found in the system.</p>
                <button 
                  onClick={() => {
                    setSelectedVet(null);
                    setVetModalMode('create');
                    setShowVetModal(true);
                  }}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Add your first veterinarian
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Vets Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Veterinarian</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {vets.map((vet) => (
                        <tr key={vet._id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {(vet.name || 'Unknown Vet').split(' ').filter(n => n.length > 0).map(n => n.charAt(0)).join('').substring(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {vet.name || 'Unknown Vet'}
                                </div>
                                <div className="text-sm text-slate-500">{vet.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{vet.email}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{vet.phone || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vet.role === 'Admin' 
                                ? 'bg-red-100 text-red-800'
                                : vet.role === 'Vet'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {vet.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vet.emailVerified 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vet.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedVet(vet);
                                  setVetModalMode('view');
                                  setShowVetModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedVet(vet);
                                  setVetModalMode('edit');
                                  setShowVetModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Business Analytics</h3>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 text-sm font-medium">User Growth</p>
                      <p className="text-2xl font-bold text-blue-800">{stats.userGrowth}%</p>
                      <p className="text-xs text-blue-600">vs last month</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 text-sm font-medium">Revenue Growth</p>
                      <p className="text-2xl font-bold text-emerald-800">{stats.revenueGrowth}%</p>
                      <p className="text-xs text-emerald-600">vs last month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-rose-700 text-sm font-medium">Today&apos;s Appointments</p>
                      <p className="text-2xl font-bold text-rose-800">{stats.todayAppointments}</p>
                      <p className="text-xs text-rose-600">active bookings</p>
                    </div>
                    <Calendar className="h-8 w-8 text-rose-600" />
                  </div>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-4">Appointment Trends</h4>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Chart visualization coming soon...</p>
                    <p className="text-sm text-slate-500 mt-2">Will show appointment trends over time</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-4">Revenue by Clinic</h4>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Chart visualization coming soon...</p>
                    <p className="text-sm text-slate-500 mt-2">Will show revenue breakdown by clinic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Dashboard */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Revenue Management</h3>
                <div className="flex space-x-4">
                  <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                    <option>Last year</option>
                  </select>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
                  <p className="text-emerald-700 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-800">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">All time</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                  <p className="text-blue-700 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-800">${stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">This month</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl">
                  <p className="text-purple-700 text-sm font-medium">Avg. per Appointment</p>
                  <p className="text-2xl font-bold text-purple-800">
                    ${stats.totalAppointments > 0 ? Math.round(stats.totalRevenue / stats.totalAppointments) : 0}
                  </p>
                  <p className="text-xs text-purple-600">Average value</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                  <p className="text-orange-700 text-sm font-medium">Growth Rate</p>
                  <p className="text-2xl font-bold text-orange-800">{stats.revenueGrowth}%</p>
                  <p className="text-xs text-orange-600">Monthly growth</p>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6">
                <h4 className="font-semibold text-slate-800 mb-4">Revenue Trends</h4>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Revenue chart visualization coming soon...</p>
                  <p className="text-sm text-slate-500 mt-2">Will show detailed revenue trends, monthly/weekly breakdowns, and projections</p>
                </div>
              </div>

              {/* Revenue by Clinic Table */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-4">Revenue by Clinic</h4>
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Clinic revenue breakdown coming soon...</p>
                  <p className="text-sm text-slate-500 mt-2">Will show revenue per clinic, top performers, and detailed analytics</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {userModalMode === 'create' && 'Create New User'}
                {userModalMode === 'edit' && 'Edit User'}
                {userModalMode === 'view' && 'User Details'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            {userModalMode === 'view' && selectedUser ? (
              // View Mode
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">User Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Name</p>
                      <p className="font-medium">{selectedUser.name || 'Unknown User'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Role</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.role === 'Admin' 
                          ? 'bg-red-100 text-red-800'
                          : selectedUser.role === 'Vet'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.emailVerified 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">Activity Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{selectedUser.petCount}</p>
                      <p className="text-sm text-slate-600">Pets Owned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.appointmentCount}</p>
                      <p className="text-sm text-slate-600">Appointments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-600">Member Since</p>
                    </div>
                  </div>
                </div>

                {/* Pets List */}
                {selectedUser.pets.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-3">Pets ({selectedUser.pets.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedUser.pets.map((pet) => (
                        <div key={pet._id} className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Heart className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="font-medium text-slate-800">{pet.name}</p>
                              <p className="text-sm text-slate-600">{pet.species} • {pet.breed}</p>
                              <p className="text-xs text-slate-500">{pet.age} years old</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setUserModalMode('edit')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Edit User
                  </button>
                </div>
              </div>
            ) : (
              // Create/Edit Mode
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">User create/edit form coming next...</p>
                  <p className="text-sm text-slate-500 mt-2">Will include form validation and CRUD operations</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vet Modal */}
      {showVetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {vetModalMode === 'create' && 'Create New Veterinarian'}
                {vetModalMode === 'edit' && 'Edit Veterinarian'}
                {vetModalMode === 'view' && 'Veterinarian Details'}
              </h3>
              <button
                onClick={() => setShowVetModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            {vetModalMode === 'view' && selectedVet ? (
              // View Mode
              <div className="space-y-6">
                {/* Vet Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">Veterinarian Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Name</p>
                      <p className="font-medium">{selectedVet.name || 'Unknown Vet'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{selectedVet.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Role</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedVet.role === 'Admin' 
                          ? 'bg-red-100 text-red-800'
                          : selectedVet.role === 'Vet'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedVet.role}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedVet.emailVerified 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedVet.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">Activity Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{selectedVet.appointmentCount}</p>
                      <p className="text-sm text-slate-600">Total Appointments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedVet.completedAppointments}</p>
                      <p className="text-sm text-slate-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedVet.pendingAppointments}</p>
                      <p className="text-sm text-slate-600">Pending</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVetModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setVetModalMode('edit')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Edit Veterinarian
                  </button>
                </div>
              </div>
            ) : (
              // Create/Edit Mode
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Veterinarian create/edit form coming next...</p>
                  <p className="text-sm text-slate-500 mt-2">Will include form validation and CRUD operations</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVetModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
