'use client';

import { Calendar, Clock, User, DollarSign, FileText } from 'lucide-react';
import Image from 'next/image';
import { formatAppointmentDate, formatTimeRange } from '@/utils/appointmentUtils';

interface AppointmentSummaryProps {
  veterinarian: {
    _id: string;
    userId: {
      name: string;
      image?: string;
    };
    specializations: string[];
    consultationFee: number;
  };
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes?: string;
  className?: string;
}

export default function AppointmentSummary({
  veterinarian,
  appointmentDate,
  appointmentTime,
  reason,
  notes,
  className = ''
}: AppointmentSummaryProps) {
  return (
    <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800 text-lg">Appointment Summary</h3>
          <p className="text-emerald-600 text-sm">Review your booking details</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Veterinarian Info */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-emerald-100">
          {veterinarian.userId.image ? (
            <Image
              src={veterinarian.userId.image}
              alt={veterinarian.userId.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">Dr. {veterinarian.userId.name}</h4>
            <p className="text-sm text-slate-600">{veterinarian.specializations.join(', ')}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">{veterinarian.consultationFee}</span>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-emerald-100">
            <div className="flex items-center text-slate-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Date</span>
            </div>
            <p className="font-semibold text-slate-900">{formatAppointmentDate(appointmentDate)}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-emerald-100">
            <div className="flex items-center text-slate-600 mb-1">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <p className="font-semibold text-slate-900">{formatTimeRange(appointmentTime)}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="p-3 bg-white rounded-lg border border-emerald-100">
          <div className="flex items-center text-slate-600 mb-1">
            <FileText className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Reason for Visit</span>
          </div>
          <p className="font-semibold text-slate-900">{reason}</p>
          {notes && (
            <div className="mt-2 pt-2 border-t border-emerald-100">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Additional Notes:</span> {notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
