import mongoose, { Schema } from 'mongoose';
import { Veterinarian, DaySchedule } from '@/types';

const DayScheduleSchema = new Schema<DaySchedule>({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  isWorking: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const VeterinarianSchema = new Schema<Veterinarian>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  specializations: [{
    type: String,
    trim: true,
    enum: ['General Practice', 'Surgery', 'Cardiology', 'Dermatology', 'Oncology', 'Orthopedics', 'Dentistry', 'Emergency', 'Exotic Animals', 'Internal Medicine']
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [60, 'Experience cannot exceed 60 years']
  },
  qualifications: [{
    type: String,
    trim: true,
    required: true
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  availability: [DayScheduleSchema],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  isAvailable: {
    type: Boolean,
    default: true
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
VeterinarianSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
VeterinarianSchema.index({ specializations: 1 });
VeterinarianSchema.index({ isAvailable: 1 });
VeterinarianSchema.index({ rating: -1 });

export const VeterinarianModel = mongoose.models.Veterinarian || mongoose.model('Veterinarian', VeterinarianSchema);
