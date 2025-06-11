import Link from "next/link";
import { Stethoscope, Calendar, Users, Shield, Heart, Award, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Stethoscope className="h-10 w-10 text-emerald-600" />
                <Heart className="h-4 w-4 text-rose-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-800">VetCare</span>
                <span className="text-2xl font-light text-emerald-600 ml-1">Pro</span>
                <div className="text-xs text-slate-500 font-medium tracking-wide">PREMIUM VETERINARY CARE</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-slate-600 hover:text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 mb-8">
              <Award className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm font-semibold text-amber-800">Award-Winning Veterinary Management Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-800 mb-6">
              <span className="block">Elevate Your</span>
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Veterinary Practice
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl leading-8 text-slate-600 font-light">
              The most trusted platform for premium veterinary clinics. Deliver exceptional care with 
              enterprise-grade tools designed for modern pet healthcare professionals.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register"
                className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1"
              >
                Start Your Premium Trial
                <div className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">30 Days Free</div>
              </Link>
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 text-lg font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-emerald-300 transition-all duration-300"
              >
                Watch Demo
                <Clock className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex items-center justify-center space-x-12 opacity-60">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">10K+</div>
                <div className="text-sm text-slate-500">Happy Vets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">500K+</div>
                <div className="text-sm text-slate-500">Pets Treated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">99.9%</div>
                <div className="text-sm text-slate-500">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Everything Your Practice Needs
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional-grade tools designed for veterinary excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 mt-4">Smart Scheduling</h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered appointment management with automated reminders and conflict prevention.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 mt-4">Digital Health Records</h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive medical histories with photo documentation and treatment tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 mt-4">Client Portal</h3>
              <p className="text-slate-600 leading-relaxed">
                Premium client experience with online booking and secure communication.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100 hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 mt-4">Enterprise Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Bank-level encryption with HIPAA compliance and automated backups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <Stethoscope className="h-8 w-8 text-emerald-400" />
              <Heart className="h-3 w-3 text-rose-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">VetCare</span>
              <span className="text-2xl font-light text-emerald-400 ml-1">Pro</span>
            </div>
          </div>
          <p className="text-center text-sm text-slate-400">
            © 2025 VetCare Pro. Premium veterinary management platform.
          </p>
          <p className="text-center text-xs text-slate-500 mt-2">
            Trusted by leading veterinary practices worldwide
          </p>
        </div>
      </footer>
    </div>
  );
}
