'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Stethoscope, Heart, LogOut, Shield, Calendar, Users, Activity } from 'lucide-react';

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

export default function DashboardPage() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);
  if (status === 'loading') {
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
      </header>      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8 mb-8">
            <div className="text-center">
              <div className="relative inline-block">
                <Stethoscope className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <Heart className="h-6 w-6 text-teal-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
                Welcome to VetCare Pro Dashboard
              </h1>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                You&apos;re successfully logged in as <span className="font-semibold text-slate-800">{session.user?.email}</span>
              </p>
              
              {session.user?.role === 'Admin' && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 max-w-md mx-auto mb-6">
                  <div className="flex items-center justify-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-emerald-800">
                        🎉 <strong>Admin Access Granted!</strong> You have full administrative privileges.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Appointments Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">Appointments</h3>
                  <p className="text-sm text-slate-600">Manage your schedule</p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  View Appointments
                </button>
              </div>
            </div>

            {/* Patients Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">Patients</h3>
                  <p className="text-sm text-slate-600">Pet records & care</p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  Manage Patients
                </button>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-cyan-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">Analytics</h3>
                  <p className="text-sm text-slate-600">Practice insights</p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                New Appointment
              </button>
              <button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                Add Patient
              </button>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                Send Reminder
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
