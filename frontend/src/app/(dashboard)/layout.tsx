'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token && !user) {
      router.push('/login');
    }
  }, [isLoading, token, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Authenticating session..." />
      </div>
    );
  }

  // If not authenticated and waiting for redirect, render minimal loader
  if (!token && !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="md" label="Redirecting to login..." />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
