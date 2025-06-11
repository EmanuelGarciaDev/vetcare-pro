import mongoose, { Schema } from 'mongoose';
import { User } from '@/types';

const UserSchema = new Schema<User>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.emailVerified; // Password required if not OAuth user
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['Customer', 'Vet', 'Admin'],
    default: 'Customer',
    required: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  emailVerified: {
    type: Date,
    default: null
  },
  image: {
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
      delete ret.password;
      return ret;
    }
  }
});

// Pre-save middleware to update the updatedAt field
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
