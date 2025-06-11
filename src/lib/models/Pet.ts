import mongoose, { Schema } from 'mongoose';
import { Pet, MedicalRecord, Vaccination } from '@/types';

const VaccinationSchema = new Schema<Vaccination>({
  vaccineName: {
    type: String,
    required: true,
    trim: true
  },
  dateAdministered: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  veterinarian: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

const MedicalRecordSchema = new Schema<MedicalRecord>({
  petId: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  vetId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  prescription: [{
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
  }],
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String
  }],
  nextVisitDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false, timestamps: true });

const PetSchema = new Schema<Pet>({
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [50, 'Pet name cannot exceed 50 characters']
  },
  species: {
    type: String,
    required: [true, 'Species is required'],
    trim: true,
    enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Reptile', 'Other']
  },
  breed: {
    type: String,
    trim: true,
    maxlength: [50, 'Breed cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [50, 'Age cannot exceed 50 years']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    max: [1000, 'Weight cannot exceed 1000 kg']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Gender is required']
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalHistory: [MedicalRecordSchema],
  vaccinations: [VaccinationSchema],
  allergies: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  profileImage: {
    type: String,
    default: null
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
PetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
PetSchema.index({ ownerId: 1 });
PetSchema.index({ species: 1 });
PetSchema.index({ name: 1 });
PetSchema.index({ createdAt: -1 });

export const PetModel = mongoose.models.Pet || mongoose.model('Pet', PetSchema);
