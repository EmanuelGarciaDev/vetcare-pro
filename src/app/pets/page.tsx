'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Stethoscope, ArrowLeft, Plus } from 'lucide-react';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
}

export default function PetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPets = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/pets');
        const data = await response.json();
        
        if (data.success) {
          setPets(data.data);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchPets();
    }
  }, [session?.user?.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <Stethoscope className="h-12 w-12 text-emerald-600 mx-auto animate-pulse" />
            <Heart className="h-4 w-4 text-teal-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading your pets...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-emerald-300 text-sm font-medium rounded-lg text-emerald-700 bg-white hover:bg-emerald-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Stethoscope className="h-8 w-8 text-emerald-600" />
                  <Heart className="h-3 w-3 text-teal-500 absolute -top-1 -right-1" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  My Pets
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-12 max-w-md mx-auto">
                <Heart className="h-16 w-16 text-emerald-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-4">No Pets Yet</h2>
                <p className="text-slate-600 mb-6">Start by adding your first pet to manage their health records and appointments.</p>
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Pet
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div key={pet._id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{pet.name}</h3>
                    <p className="text-slate-600 mb-1">{pet.species} • {pet.breed}</p>
                    <p className="text-sm text-slate-500">{pet.age} years old</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
