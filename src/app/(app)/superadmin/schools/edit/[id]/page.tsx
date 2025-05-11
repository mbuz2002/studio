
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { SchoolFormFields } from "@/components/superadmin/SchoolFormFields"; 
import type { School, EducationLevel, CustomDomainStatus } from "@/types";
import { SCHOOLS_STORAGE_KEY } from "@/types";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function EditSchoolPage() {
  const router = useRouter();
  const params = useParams();
  const { id: schoolId } = params;
  const { user: superAdminUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<School>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (superAdminUser?.role !== "SuperAdmin") {
      toast({ title: "Akses Ditolak", variant: "destructive" });
      router.push("/dashboard");
      return;
    }

    if (schoolId && typeof window !== 'undefined') {
      const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      if (storedSchools) {
        const schools: School[] = JSON.parse(storedSchools);
        const schoolToEdit = schools.find(s => s.id === schoolId);
        if (schoolToEdit) {
          setFormData({
            ...schoolToEdit,
            customDomainStatus: schoolToEdit.customDomainStatus || "unconfigured", // Ensure default if undefined
          });
          addLog("INFO", `Memuat data sekolah "${schoolToEdit.name}" (ID: ${schoolId}) untuk diedit oleh SuperAdmin ${superAdminUser.email}.`, "EditSchoolPage");
        } else {
          toast({ title: "Sekolah Tidak Ditemukan", variant: "destructive" });
          router.push("/superadmin/schools");
        }
      }
      setIsLoadingData(false);
    }
  }, [schoolId, superAdminUser, authLoading, router, toast, addLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
     if (name === "jenjangPendidikan" || name === "subscriptionStatus" || name === "customDomainStatus") {
        setFormData(prev => ({ ...prev, [name]: value as EducationLevel | School['subscriptionStatus'] | CustomDomainStatus}));
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
    if (!formData.name) {
      toast({ title: "Nama Sekolah wajib diisi.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const updatedSchool: School = {
      ...formData,
      id: schoolId as string,
      updatedAt: new Date().toISOString(),
      customDomain: formData.customDomain || undefined, // Ensure empty string becomes undefined
      customDomainStatus: formData.customDomainStatus || "unconfigured",
    } as School;

    try {
      const existingSchools = JSON.parse(localStorage.getItem(SCHOOLS_STORAGE_KEY) || "[]") as School[];
      const updatedSchools = existingSchools.map(s => s.id === schoolId ? updatedSchool : s);
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(updatedSchools));
      toast({ title: "Data Sekolah Diperbarui", description: `Data untuk "${updatedSchool.name}" berhasil diperbarui.` });
      addLog("INFO", `Data sekolah "${updatedSchool.name}" (ID: ${schoolId}) diperbarui oleh SuperAdmin ${superAdminUser?.email}. Domain Kustom: ${updatedSchool.customDomain || '-'}(${updatedSchool.customDomainStatus})`, "EditSchoolPage");
      router.push("/superadmin/schools");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui data sekolah "${updatedSchool.name}" (ID: ${schoolId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditSchoolPage");
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData || authLoading || !superAdminUser || superAdminUser.role !== "SuperAdmin") {
    return <LoadingSpinner message="Memuat data sekolah..." icon={<Building className="h-12 w-12 animate-pulse text-primary mb-4"/>} />;
  }
  
  if (!formData.id && !isLoadingData) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-destructive text-lg">Data sekolah tidak ditemukan.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Edit Data Sekolah</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1 truncate max-w-md">
                {formData.name || "Memuat..."}
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
              isEditMode={true}
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push('/superadmin/schools')} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

