
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function SuperAdminSubscriptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "SuperAdmin") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "SuperAdmin") {
    return <LoadingSpinner message="Memuat Manajemen Langganan..." icon={<CreditCard className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Manajemen Langganan</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Kelola status langganan untuk semua sekolah. (Fitur Mendatang)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 p-4 md:p-6">
          <p className="text-muted-foreground">
            Halaman ini akan berisi fitur untuk mengelola langganan sekolah, termasuk aktivasi, perpanjangan, dan pembatalan.
            Fitur ini sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
