# 🐾 VetCare Pro - Premium Veterinary Clinic Management System

A modern, full-featured veterinary clinic management system built with Next.js 15, TypeScript, MongoDB, and NextAuth.js for Google OAuth authentication.

![VetCare Pro](https://img.shields.io/badge/VetCare%20Pro-Premium%20Pet%20Care-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🔐 **Authentication & Authorization**
- **Google OAuth 2.0** integration with NextAuth.js
- **Role-based access control** (Admin, Veterinarian, Staff, Customer)
- **Persistent sessions** with MongoDB adapter
- **Automatic admin privileges** for designated email addresses

### 🎨 **Premium UI/UX Design**
- **Modern glass morphism** design with backdrop blur effects
- **Emerald/Teal gradient** color palette for premium aesthetic
- **Responsive design** optimized for all devices
- **Smooth animations** and hover effects throughout
- **Professional typography** using Inter font family

### 📋 **Core Functionality**
- **Dashboard** with overview cards and quick actions
- **User management** with comprehensive profiles
- **Veterinarian profiles** with specializations and availability
- **Appointment scheduling** system
- **Pet records** management
- **Notification** system

### 🛠️ **Technical Excellence**
- **Type-safe** with comprehensive TypeScript interfaces
- **Database models** with Mongoose schemas and validation
- **Error handling** with proper TypeScript error types
- **Performance optimized** with Next.js 15 and Turbopack
- **Code quality** with ESLint and strict TypeScript config

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** 7.0+ (local or Atlas)
- **Google Cloud** project with OAuth 2.0 credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vetcare-pro.git
   cd vetcare-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/vetcare-pro
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # Reusable components
│   └── Providers.tsx     # Session provider wrapper
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # MongoDB connection
│   └── models/           # Mongoose schemas
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🔧 Configuration

### Google OAuth Setup

1. **Google Cloud Console**
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Admin Configuration**
   - Modify `src/lib/auth.ts` to set admin email addresses
   - Admin users get automatic elevated privileges

### Database Models

- **User**: Basic user information and authentication
- **Veterinarian**: Professional profiles with specializations
- **Pet**: Pet records and medical history
- **Appointment**: Scheduling and booking system
- **Notification**: System notifications and alerts

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (500-700)
- **Secondary**: Teal (500-700)
- **Accent**: Cyan (500-600)
- **Neutral**: Slate (50-900)
- **Success**: Emerald variants
- **Error**: Rose/Red variants

### Components
- **Glass morphism** cards with backdrop blur
- **Gradient buttons** with shadow effects
- **Premium form inputs** with focus states
- **Responsive navigation** with mobile support

## 📱 Pages Overview

### 🏠 **Homepage**
- Hero section with premium branding
- Feature highlights and service overview
- Testimonials and trust indicators
- Call-to-action sections

### 🔐 **Authentication**
- **Login**: Google OAuth integration
- **Register**: Comprehensive user registration
- **Dashboard**: Role-based dashboard with cards

### 📊 **Dashboard Features**
- Welcome section with user info
- Quick action buttons
- Service cards (Appointments, Patients, Analytics)
- Admin privilege indicators

## 🛡️ Security Features

- **Environment variable** protection
- **CSRF protection** with NextAuth.js
- **Session management** with secure cookies
- **Role-based access control**
- **Input validation** with Mongoose schemas

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t vetcare-pro .
docker run -p 3000:3000 vetcare-pro
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js team** for the amazing framework
- **Vercel** for hosting and deployment
- **Tailwind CSS** for the utility-first CSS framework
- **NextAuth.js** for authentication
- **MongoDB** for the database solution

---

<div align="center">
  <p>Built with ❤️ for the veterinary community</p>
  <p>
    <a href="#top">Back to top</a>
  </p>
</div>
