
"use client";
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ShieldCheck } from 'lucide-react';

export default function SuperAdminLayout({ children }: PropsWithChildren) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'SuperAdmin') {
        router.replace('/login'); // Redirect to login if not authenticated or not SuperAdmin
      }
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || user?.role !== 'SuperAdmin') {
    // Show a loading spinner or a minimal layout while checking auth
    return <LoadingSpinner message="Memverifikasi Akses Super Admin..." icon={<ShieldCheck className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  return <>{children}</>;
}
