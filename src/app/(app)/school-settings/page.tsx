
"use client";

import { SchoolProfileForm } from "@/components/settings/SchoolProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Building } from "lucide-react";

export default function SchoolSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading) {
      if (!user || !["Admin", "TataUsaha", "KepalaSekolah"].includes(user.role)) { // Added KepalaSekolah
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
    }
  }, [isClient, user, authLoading, router, toast]);

  if (!isClient || authLoading || !user) {
    return <LoadingSpinner message="Memuat pengaturan sekolah..." icon={<Building className="h-16 w-16 animate-pulse text-primary mb-6" />} />;
  }
  
  if (!["Admin", "TataUsaha", "KepalaSekolah"].includes(user.role)) { // Added KepalaSekolah
     return (
      <div className="flex h-[calc(100vh-150px)] items-center justify-center">
        <p className="text-lg text-muted-foreground">Akses ditolak. Hanya Admin, Kepala Sekolah, dan Tata Usaha yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <SchoolProfileForm />
    </div>
  );
}

