import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'Customer' | 'Vet' | 'Admin';
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date;
  image?: string;
}

export interface Pet {
  _id?: ObjectId;
  id?: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight?: number;
  color?: string;
  gender: 'Male' | 'Female';
  ownerId: ObjectId | string;
  medicalHistory: MedicalRecord[];
  vaccinations: Vaccination[];
  allergies?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
}

export interface Veterinarian {
  _id?: ObjectId;
  id?: string;
  userId: ObjectId | string;
  licenseNumber: string;
  specializations: string[];
  experience: number;
  qualifications: string[];
  consultationFee: number;
  availability: DaySchedule[];
  rating: number;
  reviewCount: number;
  bio?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface Appointment {
  _id?: ObjectId;
  id?: string;
  petId: ObjectId | string;
  clinicId: ObjectId | string;
  vetId?: ObjectId | string; // Made optional for clinic-based booking
  customerId: ObjectId | string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';
  type: 'Consultation' | 'Vaccination' | 'Surgery' | 'Emergency' | 'Checkup' | 'Grooming';
  reason: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: Prescription[];
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  _id?: ObjectId;
  id?: string;
  petId: ObjectId | string;
  vetId: ObjectId | string;
  appointmentId?: ObjectId | string;
  date: Date;
  diagnosis: string;
  treatment: string;
  prescription: Prescription[];
  notes?: string;
  attachments?: string[];
  nextVisitDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Vaccination {
  vaccineName: string;
  dateAdministered: Date;
  expiryDate: Date;
  batchNumber?: string;
  veterinarian: string;
  notes?: string;
}

export interface Notification {
  _id?: ObjectId;
  id?: string;
  userId: ObjectId | string;
  title: string;
  message: string;
  type: 'Appointment' | 'Reminder' | 'System' | 'Payment' | 'Medical';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  isAvailable: boolean;
  vetId: string;
}

export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  totalPets: number;
  totalRevenue: number;
  upcomingAppointments: Appointment[];
  recentNotifications: Notification[];
}

export interface VetDashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  upcomingAppointments: Appointment[];
  pendingRecords: number;
}

export interface CustomerDashboardStats {
  totalPets: number;
  upcomingAppointments: number;
  lastVisit?: Date;
  pets: Pet[];
  recentAppointments: Appointment[];
  notifications: Notification[];
}

// Form Types
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Customer' | 'Vet';
  phone?: string;
  address?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight?: number;
  color?: string;
  gender: 'Male' | 'Female';
  allergies?: string[];
  notes?: string;
}

export interface AppointmentFormData {
  petId: string;
  vetId: string;
  appointmentDate: string;
  startTime: string;
  type: string;
  reason: string;
  notes?: string;
}

export interface VetProfileFormData {
  licenseNumber: string;
  specializations: string[];
  experience: number;
  qualifications: string[];
  consultationFee: number;
  bio?: string;
  availability: DaySchedule[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and Search Types
export interface AppointmentFilters {
  status?: string;
  date?: string;
  vetId?: string;
  customerId?: string;
  type?: string;
}

export interface PetFilters {
  species?: string;
  breed?: string;
  ownerId?: string;
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Email Template Types
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface AppointmentEmailData {
  customerName: string;
  vetName: string;
  petName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  clinicName: string;
  clinicAddress: string;
  appointmentId: string;
}

export interface Clinic {
  _id?: ObjectId;
  id?: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  description?: string;
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

// Global type extensions
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

export {};
