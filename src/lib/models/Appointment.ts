import mongoose, { Schema } from 'mongoose';
import { Appointment, Prescription } from '@/types';

const PrescriptionSchema = new Schema<Prescription>({
  medicationName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  }
}, { _id: false });

const AppointmentSchema = new Schema<Appointment>({
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  vetId: {
    type: Schema.Types.ObjectId,
    ref: 'Veterinarian',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow'],
    default: 'Scheduled',
    required: true
  },
  type: {
    type: String,
    enum: ['Consultation', 'Vaccination', 'Surgery', 'Emergency', 'Checkup', 'Grooming'],
    required: [true, 'Appointment type is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    trim: true,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  treatment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Treatment cannot exceed 1000 characters']
  },
  prescription: [PrescriptionSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save middleware
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validation to ensure end time is after start time
AppointmentSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Create indexes
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ vetId: 1, appointmentDate: 1 });
AppointmentSchema.index({ customerId: 1 });
AppointmentSchema.index({ petId: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ createdAt: -1 });

export const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
