"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Save, ArrowLeft, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { SchoolFormFields } from "@/components/superadmin/SchoolFormFields";
import type { School, User, EducationLevel, CustomDomainStatus } from "@/types";
import { SCHOOLS_STORAGE_KEY, APP_USERS_STORAGE_KEY, DEFAULT_FEATURE_SETTINGS } from "@/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatISO } from "date-fns";

export default function NewSchoolPage() {
  const router = useRouter();
  const { user: superAdminUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<School>>({
    name: "",
    jenjangPendidikan: "SMA/MA",
    alamat: "",
    nomorTelepon: "",
    emailSekolah: "",
    namaKepalaSekolah: "",
    npsn: "",
    logoUrl: "",
    kotaSekolah: "",
    adminEmail: "",
    subscriptionStatus: "trial",
    subscriptionStartDate: formatISO(new Date(), { representation: 'date' }),
    subscriptionEndDate: formatISO(new Date(new Date().setMonth(new Date().getMonth() + 1)), { representation: 'date' }),
    isActive: true,
    featureSettings: { ...DEFAULT_FEATURE_SETTINGS },
    customDomain: "",
    customDomainStatus: "unconfigured", 
  });
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && superAdminUser?.role !== "SuperAdmin") {
      toast({ title: "Akses Ditolak", variant: "destructive" });
      router.push("/dashboard");
    }
  }, [superAdminUser, authLoading, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "jenjangPendidikan" || name === "subscriptionStatus" || name === "customDomainStatus") {
        setFormData(prev => ({ ...prev, [name]: value as EducationLevel | School['subscriptionStatus'] | CustomDomainStatus }));
    } else if (name === "isActive") {
        setFormData(prev => ({ ...prev, [name]: value === "true" }));
    } else if (name === "subscriptionStartDate" || name === "subscriptionEndDate") {
        setFormData(prev => ({ ...prev, [name]: value ? new Date(value).toISOString() : undefined }));
    }
     else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, logoUrl: url }));
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.adminEmail || !adminPassword) {
      toast({ title: "Data Tidak Lengkap", description: "Nama Sekolah, Email Admin, dan Kata Sandi Admin wajib diisi.", variant: "destructive" });
      return;
    }
    if (adminPassword.length < 6) {
      toast({ title: "Kata Sandi Admin Tidak Valid", description: "Kata sandi admin minimal 6 karakter.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const newSchoolId = `school-${Date.now()}`;
    const newSchoolAdminId = `user-admin-${Date.now()}`;

    const finalCustomDomain = formData.customDomain?.trim() || "";
    const finalCustomDomainStatus: CustomDomainStatus = finalCustomDomain ? "pending_verification" : "unconfigured";

    const newSchool: School = {
      id: newSchoolId,
      name: formData.name!,
      jenjangPendidikan: formData.jenjangPendidikan || "SMA/MA",
      alamat: formData.alamat || "",
      nomorTelepon: formData.nomorTelepon || "",
      emailSekolah: formData.emailSekolah || "",
      namaKepalaSekolah: formData.namaKepalaSekolah || "",
      npsn: formData.npsn,
      logoUrl: formData.logoUrl,
      kotaSekolah: formData.kotaSekolah,
      adminEmail: formData.adminEmail!,
      subscriptionStatus: formData.subscriptionStatus || "trial",
      subscriptionStartDate: formData.subscriptionStartDate,
      subscriptionEndDate: formData.subscriptionEndDate,
      paymentDetails: formData.paymentDetails,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featureSettings: formData.featureSettings || { ...DEFAULT_FEATURE_SETTINGS },
      customDomain: finalCustomDomain || undefined, // Store as undefined if empty for cleaner data
      customDomainStatus: finalCustomDomainStatus,
    };

    const newSchoolAdmin: User = {
      id: newSchoolAdminId,
      name: `Admin ${formData.name}`,
      email: formData.adminEmail!,
      role: "Admin",
      schoolId: newSchoolId,
      avatarUrl: `https://ui-avatars.com/api/?name=Admin+${encodeURIComponent(formData.name!)}&background=random&color=fff`,
      updatedAt: new Date().toISOString(),
    };

    try {
      const existingSchools = JSON.parse(localStorage.getItem(SCHOOLS_STORAGE_KEY) || "[]") as School[];
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify([newSchool, ...existingSchools]));
      addLog("INFO", `Sekolah baru "${newSchool.name}" ditambahkan oleh SuperAdmin ${superAdminUser?.email}. Domain Kustom: ${newSchool.customDomain || '-'}(${newSchool.customDomainStatus})`, "NewSchoolPage");

      const existingUsers = JSON.parse(localStorage.getItem(APP_USERS_STORAGE_KEY) || "[]") as User[];
      localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify([newSchoolAdmin, ...existingUsers]));
      addLog("INFO", `Admin sekolah baru "${newSchoolAdmin.email}" untuk sekolah "${newSchool.name}" dibuat. Kata sandi telah di-set (simulasi).`, "NewSchoolPage");

      toast({ title: "Sekolah Ditambahkan", description: `Sekolah "${newSchool.name}" dan admin awal berhasil dibuat.` });
      router.push("/superadmin/schools");
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan data sekolah atau admin.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan sekolah baru "${newSchool.name}". Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewSchoolPage");
      setIsSubmitting(false);
    }
  };

  if (authLoading || !superAdminUser || superAdminUser.role !== "SuperAdmin") {
    return <LoadingSpinner message="Memuat..." icon={<Building className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Tambah Sekolah Baru</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Masukkan detail untuk sekolah baru dan admin awalnya.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SchoolFormFields
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleLogoUrlChange={handleLogoUrlChange}
              adminPassword={adminPassword}
              handleAdminPasswordChange={(e) => setAdminPassword(e.target.value)}
              isEditMode={false}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/superadmin/schools')} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Sekolah & Admin
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
