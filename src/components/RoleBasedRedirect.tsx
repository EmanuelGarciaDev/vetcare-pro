'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Extend session type to include role
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

interface RoleBasedRedirectProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'Vet' | 'Customer';
  redirectTo?: string;
}

export default function RoleBasedRedirect({ 
  children, 
  requiredRole,
  redirectTo 
}: RoleBasedRedirectProps) {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role;

      // If a specific role is required and user doesn't have it
      if (requiredRole && userRole !== requiredRole) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Default role-based redirects
          switch (userRole) {
            case 'Admin':
              router.push('/admin');
              break;
            case 'Vet':
              router.push('/vet');
              break;
            case 'Customer':
            default:
              router.push('/dashboard');
              break;
          }
        }
        return;
      }

      // If no specific role required, do role-based redirect from root
      if (!requiredRole && window.location.pathname === '/dashboard') {
        switch (userRole) {
          case 'Admin':
            router.push('/admin');
            break;
          case 'Vet':
            router.push('/vet');
            break;
          case 'Customer':
          default:
            // Stay on dashboard for customers
            break;
        }
      }
    }
  }, [status, session, router, requiredRole, redirectTo]);

  // Show loading while redirecting
  if (status === 'loading' || 
      (status === 'authenticated' && requiredRole && session?.user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
