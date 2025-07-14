'use client';

import { useAuth } from '@/providers/auth-provider';
import Header from '@/components/header';
import LandingPage from '@/components/landing-page';
import Dashboard from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {loading ? (
          <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-96 w-full" />
          </div>
        ) : user ? (
          <Dashboard />
        ) : (
          <LandingPage />
        )}
      </main>
    </div>
  );
}
