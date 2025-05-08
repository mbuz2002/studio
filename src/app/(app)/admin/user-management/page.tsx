
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementSection } from "@/components/settings/UserManagementSection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memverifikasi akses...</p>
      </div>
    );
  }

  if (!user || (user.role !== "Admin" && user.role !== "TataUsaha")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Akses ditolak.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Manajemen Pengguna</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Kelola akun pengguna, peran, dan akses mereka ke sistem EduAI Planner.
          </CardDescription>
        </CardHeader>
      </Card>
      <UserManagementSection />
    </div>
  );
}
