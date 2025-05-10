
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";

export default function TimetablesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    addLog("INFO", `Pengguna ${user.email} mengakses halaman Jadwal Pelajaran.`, "TimetablesPage");
  }, [user, authLoading, router, addLog]);


  if (!isClient || authLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ListChecks className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat jadwal pelajaran...</p>
      </div>
    );
  }

  const canManage = user && ["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role);

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ListChecks className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Jadwal Pelajaran</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Lihat dan kelola jadwal pelajaran sekolah.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Daftar Jadwal Tersimpan</h2>
            {canManage && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/timetables/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Buat Jadwal Baru
                </Link>
              </Button>
            )}
          </div>
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <ListChecks className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Fitur detail jadwal pelajaran sedang dalam pengembangan.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Anda akan dapat membuat, mengedit, dan melihat jadwal secara komprehensif di sini.
            </p>
             {/* Placeholder for future timetable display */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
