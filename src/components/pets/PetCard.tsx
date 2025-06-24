import Image from 'next/image';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  ownerId: string;
  imageUrl?: string;
  createdAt?: string;
}

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Pet Image */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
        {pet.imageUrl ? (
          <Image
            src={pet.imageUrl}
            alt={pet.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-20 h-20 bg-emerald-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Pet Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{pet.name}</h3>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
            {pet.species}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Breed:</span>
            <span className="text-gray-900 font-medium">{pet.breed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Age:</span>
            <span className="text-gray-900 font-medium">{pet.age}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Weight:</span>
            <span className="text-gray-900 font-medium">{pet.weight}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors duration-200 font-medium">
            View Profile
          </button>
          <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9H4a1 1 0 110-2h4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
