
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { School, User, EducationLevel } from "@/types";
import { SCHOOLS_STORAGE_KEY, APP_USERS_STORAGE_KEY, DEFAULT_FEATURE_SETTINGS } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { formatISO, addDays } from "date-fns";

const educationLevels: { value: EducationLevel; label: string }[] = [
  { value: "PAUD", label: "Pendidikan Anak Usia Dini (PAUD)" },
  { value: "SD/MI", label: "Sekolah Dasar / Madrasah Ibtidaiyah (SD/MI)" },
  { value: "SMP/MTs", label: "Sekolah Menengah Pertama / Madrasah Tsanawiyah (SMP/MTs)" },
  { value: "SMA/MA", label: "Sekolah Menengah Atas / Madrasah Aliyah (SMA/MA)" },
  { value: "SMK/MAK", label: "Sekolah Menengah Kejuruan / Madrasah Aliyah Kejuruan (SMK/MAK)" },
  { value: "SLB", label: "Sekolah Luar Biasa (SLB)" },
  { value: "PKBM/Kesetaraan", label: "Pusat Kegiatan Belajar Masyarakat (PKBM) / Pendidikan Kesetaraan" },
];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth(); 
  const { toast } = useToast();
  const { addLog } = useLog();

  const [schoolName, setSchoolName] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("SMA/MA");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({ title: "Pendaftaran Gagal", description: "Kata sandi dan konfirmasi kata sandi tidak cocok.", variant: "destructive" });
      addLog("WARN", `Pendaftaran gagal: Kata sandi tidak cocok untuk email ${adminEmail}.`, "SignupPage");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast({ title: "Pendaftaran Gagal", description: "Kata sandi minimal 6 karakter.", variant: "destructive" });
      addLog("WARN", `Pendaftaran gagal: Kata sandi kurang dari 6 karakter untuk email ${adminEmail}.`, "SignupPage");
      setIsLoading(false);
      return;
    }

    const existingSchools: School[] = JSON.parse(localStorage.getItem(SCHOOLS_STORAGE_KEY) || "[]");
    if (existingSchools.some(s => s.name.toLowerCase() === schoolName.toLowerCase())) {
      toast({ title: "Pendaftaran Gagal", description: "Nama sekolah sudah terdaftar.", variant: "destructive" });
      addLog("WARN", `Pendaftaran gagal: Nama sekolah "${schoolName}" sudah ada.`, "SignupPage");
      setIsLoading(false);
      return;
    }

    const existingUsers: User[] = JSON.parse(localStorage.getItem(APP_USERS_STORAGE_KEY) || "[]");
    if (existingUsers.some(u => u.email.toLowerCase() === adminEmail.toLowerCase())) {
      toast({ title: "Pendaftaran Gagal", description: "Email admin sudah terdaftar.", variant: "destructive" });
      addLog("WARN", `Pendaftaran gagal: Email admin "${adminEmail}" sudah ada.`, "SignupPage");
      setIsLoading(false);
      return;
    }

    const newSchoolId = `school-${Date.now()}`;
    const newAdminId = `user-${Date.now()}`;
    const trialEndDate = addDays(new Date(), 7); // Updated trial period to 7 days

    const newSchool: School = {
      id: newSchoolId,
      name: schoolName,
      jenjangPendidikan: educationLevel,
      adminEmail: adminEmail,
      subscriptionStatus: 'trial',
      subscriptionStartDate: formatISO(new Date(), { representation: 'date' }),
      subscriptionEndDate: formatISO(trialEndDate, { representation: 'date' }),
      isActive: true,
      featureSettings: { ...DEFAULT_FEATURE_SETTINGS },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      alamat: "",
      nomorTelepon: "",
      emailSekolah: "",
      namaKepalaSekolah: "",
      npsn: "",
      logoUrl: "",
      kotaSekolah: ""
    };

    const newAdmin: User = {
      id: newAdminId,
      name: adminName,
      email: adminEmail,
      role: "Admin",
      schoolId: newSchoolId,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName || adminEmail)}&background=random&color=fff`,
      updatedAt: new Date().toISOString(),
    };
    
    existingSchools.push(newSchool);
    localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(existingSchools));
    addLog("INFO", `Sekolah baru "${schoolName}" (ID: ${newSchoolId}) berhasil didaftarkan dengan status trial 7 hari.`, "SignupPage");

    existingUsers.push(newAdmin);
    localStorage.setItem(APP_USERS_STORAGE_KEY, JSON.stringify(existingUsers));
    addLog("INFO", `Admin "${adminName}" (Email: ${adminEmail}) untuk sekolah "${schoolName}" berhasil dibuat.`, "SignupPage");
    
    toast({
      title: "Pendaftaran Berhasil!",
      description: `Sekolah "${schoolName}" dan akun admin Anda telah dibuat. Anda akan diarahkan ke dasbor.`,
    });
    
    login(adminEmail, password, "Admin", newSchoolId);
  };


  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden border-border/50">
        <CardHeader className="text-center pt-8 pb-6 bg-card">
          <div className="mb-5 flex items-center justify-center text-primary">
            <GraduationCap size={56} strokeWidth={1.5} className="text-primary drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">Daftar GUMPLA AI</CardTitle>
          <CardDescription className="text-base md:text-lg text-muted-foreground pt-1.5">
            Buat akun sekolah baru dan mulai kelola kurikulum Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6 bg-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName">Nama Sekolah</Label>
              <Input id="schoolName" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Contoh: SMA Negeri 1 Impian" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="educationLevel">Jenjang Pendidikan</Label>
              <Select value={educationLevel} onValueChange={(value) => setEducationLevel(value as EducationLevel)} disabled={isLoading}>
                <SelectTrigger id="educationLevel"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {educationLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-1.5">
              <Label htmlFor="adminName">Nama Lengkap Admin Pendaftar</Label>
              <Input id="adminName" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Contoh: Budi Sanjaya" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail">Email Admin Pendaftar</Label>
              <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@namasekolah.sch.id" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi kata sandi" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-base py-3 h-12 rounded-md shadow-lg" disabled={isLoading}>
              {isLoading ? <GraduationCap className="mr-2.5 h-5 w-5 animate-pulse" /> : <UserPlus className="mr-2.5 h-5 w-5" />}
              {isLoading ? "Memproses Pendaftaran..." : "Daftar Sekarang (Uji Coba 7 Hari)"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pb-8 pt-4 bg-muted/30 border-t">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun sekolah?{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Masuk di sini.
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
