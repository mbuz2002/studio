
"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementSection } from "@/components/settings/UserManagementSection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { useLog } from "@/contexts/LogContext";

export default function UserManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { addLog } = useLog();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isClient) {
      if (!user || (user.role !== "Admin" && user.role !== "TataUsaha")) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          variant: "destructive",
        });
        if (user) {
          addLog("WARN", `Pengguna ${user.email} (Peran: ${user.role}) mencoba mengakses Manajemen Pengguna tanpa izin.`, "UserManagementPage");
        }
        router.push("/dashboard");
      } else {
        addLog("INFO", `Pengguna ${user.email} mengakses halaman Manajemen Pengguna.`, "UserManagementPage");
      }
      setPageLoading(false);
    }
  }, [user, authLoading, isClient, router, toast, addLog]);

  if (pageLoading || authLoading || !isClient) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
         <div className="flex flex-col items-center text-center">
          <Users className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memverifikasi akses...</p>
           <p className="text-sm text-muted-foreground">Menyiapkan manajemen pengguna.</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "Admin" && user.role !== "TataUsaha")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Akses ditolak.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-4 sm:p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">Manajemen Pengguna</CardTitle>
                <CardDescription className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mt-1">
                    Kelola akun pengguna, peran, dan akses mereka ke sistem EduAI Planner.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="overflow-x-auto">
        <UserManagementSection />
      </div>
    </div>
  );
}
