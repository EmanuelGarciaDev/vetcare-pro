'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      // Reduce session polling to minimize API calls
      refetchInterval={5 * 60} // 5 minutes instead of default 30 seconds
      refetchOnWindowFocus={false} // Don't refetch on every window focus
    >
      {children}
    </SessionProvider>
  );
}
