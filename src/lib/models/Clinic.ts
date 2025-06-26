import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  description: string;
  services: string[];
  hours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  pricing: {
    consultation: number;
    vaccination: number;
    checkup: number;
    emergency: number;
    surgery: number;
    grooming: number;
  };
  features: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
  isEmergency24h: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<IClinic>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  services: [{
    type: String,
    trim: true
  }],
  hours: {
    monday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '16:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '14:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  pricing: {
    consultation: { type: Number, default: 75 },
    vaccination: { type: Number, default: 45 },
    checkup: { type: Number, default: 60 },
    emergency: { type: Number, default: 150 },
    surgery: { type: Number, default: 300 },
    grooming: { type: Number, default: 40 }
  },
  features: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  images: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEmergency24h: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes
ClinicSchema.index({ name: 1 });
ClinicSchema.index({ 'address.city': 1 });
ClinicSchema.index({ isActive: 1 });
ClinicSchema.index({ rating: -1 });

export const ClinicModel = mongoose.models.Clinic || mongoose.model<IClinic>('Clinic', ClinicSchema);
