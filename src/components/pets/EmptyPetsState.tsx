import Link from 'next/link';

export default function EmptyPetsState() {
  return (
    <div className="text-center py-12">
      <div className="max-w-sm mx-auto">
        {/* Empty State Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* Empty State Text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No pets yet
        </h3>
        <p className="text-gray-500 mb-8">
          Add your first pet to start managing their health records and booking appointments.
        </p>

        {/* Add Pet Button */}
        <Link
          href="/booking?step=1"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Your First Pet
        </Link>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Health Records</h4>
          <p className="text-sm text-gray-500">Keep track of vaccinations, medications, and medical history</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a2 2 0 01-2-2V9H4a1 1 0 110-2h4z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Appointments</h4>
          <p className="text-sm text-gray-500">Schedule and manage veterinary appointments</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8a3 3 0 100-6 3 3 0 000 6zm-8 6a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Reminders</h4>
          <p className="text-sm text-gray-500">Get notified about upcoming appointments and care</p>
        </div>
      </div>
    </div>
  );
}
