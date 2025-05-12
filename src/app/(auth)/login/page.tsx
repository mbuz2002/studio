"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, LogIn, ShieldAlert, Building } from "lucide-react";
import Link from "next/link";
import type { FormEvent} from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole, School } from "@/types";
import { APP_USERS_STORAGE_KEY, SCHOOLS_STORAGE_KEY } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/loading-spinner";

const roles: { value: UserRole; label: string }[] = [
  { value: "Admin", label: "Admin Sekolah" },
  { value: "KepalaSekolah", label: "Kepala Sekolah" },
  { value: "WakaKurikulum", label: "Waka Kurikulum" },
  { value: "TataUsaha", label: "Tata Usaha" },
  { value: "Guru", label: "Guru" },
];

const slugify = (text: string = ""): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


export default function LoginPage() {
  const { login, loading: authLoadingState, user: authenticatedUser } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Guru");
  const [isLoading, setIsLoading] = useState(false);
  const [schoolForLogin, setSchoolForLogin] = useState<School | null | undefined>(undefined); 
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const schoolIdentifier = searchParams.get('school'); 

    if (schoolIdentifier) {
      const schoolsData = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      if (schoolsData) {
        const schools: School[] = JSON.parse(schoolsData);
        
        let foundSchool = schools.find(s => s.id === schoolIdentifier && s.isActive); 
        if (!foundSchool) {
          foundSchool = schools.find(s => slugify(s.name) === schoolIdentifier && s.isActive);
        }
        setSchoolForLogin(foundSchool || null);
      } else {
        setSchoolForLogin(null); 
      }
    } else {
      router.replace('/login-by-school');
      return; 
    }
    setPageLoading(false);
  }, [searchParams, router]);

  useEffect(() => {
    // If login was successful (user context updated), and we were in a loading state, reset it.
    // This handles the case where AuthContext navigates before the local timeout.
    if (authenticatedUser && isLoading) {
      setIsLoading(false);
    }
  }, [authenticatedUser, isLoading]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email && selectedRole && password) {
      setIsLoading(true); 
      
      if (!schoolForLogin && selectedRole !== "SuperAdmin") {
          toast({
            title: "Login Gagal",
            description: "Informasi sekolah tidak ditemukan atau tidak aktif. Harap akses melalui URL sekolah yang benar.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
      }

      const schoolIdToLogin = schoolForLogin ? schoolForLogin.id : undefined;
      login(email, password, selectedRole, schoolIdToLogin); 
      
      // Set a timeout to reset isLoading state *if* login does not cause navigation
      // This is a fallback for login failures where AuthContext toasts and returns.
      const timer = setTimeout(() => {
        // Check if still loading (i.e., not navigated away by successful login)
        // and also check if there's no authenticated user (meaning login actually failed)
        if (isLoading && !authenticatedUser) { 
            setIsLoading(false);
        }
      }, 1500); // Reduced timeout for better UX on failure
      return () => clearTimeout(timer);

    } else {
      toast({
        title: "Data Tidak Lengkap",
        description: "Harap isi email, kata sandi, dan pilih peran.",
        variant: "destructive"
      });
    }
  };
  
  if (pageLoading || authLoadingState) {
    return <LoadingSpinner message="Mempersiapkan halaman login..." icon={<LogIn className="h-12 w-12 text-primary animate-pulse" />} />;
  }

  if (searchParams.get('school') && schoolForLogin === null && !pageLoading) {
    return (
       <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
        <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-destructive/50">
            <CardHeader className="text-center pt-8 pb-6 bg-card">
                 <div className="mb-5 flex items-center justify-center text-destructive">
                    <ShieldAlert size={56} strokeWidth={1.5} className="drop-shadow-md" />
                 </div>
                 <CardTitle className="text-3xl md:text-4xl font-bold text-destructive">Sekolah Tidak Ditemukan atau Tidak Aktif</CardTitle>
                 <CardDescription className="text-base md:text-lg text-muted-foreground pt-1.5">
                    URL login sekolah yang Anda masukkan tidak valid, sekolah tidak terdaftar, atau tidak aktif.
                 </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-6 bg-card">
                <p className="text-center text-muted-foreground mb-4">
                    Pastikan Anda menggunakan tautan yang benar atau hubungi administrator sekolah Anda.
                </p>
                <Button onClick={() => router.push('/login-by-school')} className="w-full">Pilih Sekolah Lain</Button>
            </CardContent>
        </Card>
       </div>
    );
  }


  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-border/50">
        <CardHeader className="text-center pt-8 pb-6 bg-card">
          <div className="mb-5 flex items-center justify-center text-primary">
            {schoolForLogin && schoolForLogin.logoUrl ? (
              <Image 
                src={schoolForLogin.logoUrl} 
                alt={`${schoolForLogin.name} Logo`} 
                width={64} 
                height={64} 
                className="object-contain rounded-md shadow-md" 
                data-ai-hint="school logo" 
              />
            ) : schoolForLogin ? (
               <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center shadow-md" title={schoolForLogin.name}>
                    <Building size={36} className="text-primary/70" />
               </div>
            ) : (
              <GraduationCap size={56} strokeWidth={1.5} className="text-primary drop-shadow-md" />
            )}
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
            {schoolForLogin ? schoolForLogin.name : "GUMPLA AI"}
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-muted-foreground pt-1.5">
            {schoolForLogin ? `Masuk ke portal ${schoolForLogin.jenjangPendidikan}` : "Harap pilih sekolah Anda."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6 bg-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Alamat Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="anda@sekolahanda.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base h-11 rounded-md focus:border-primary"
                disabled={isLoading || !schoolForLogin}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm font-medium text-foreground">Masuk Sebagai</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} disabled={isLoading || !schoolForLogin}>
                <SelectTrigger id="role" className="text-base h-11 rounded-md focus:border-primary">
                  <SelectValue placeholder="Pilih peran Anda" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value} className="text-base">{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Kata Sandi</Label>
                {schoolForLogin && (
                   <Link href={`/forgot-password?school=${schoolForLogin.id}`} className="text-xs text-primary hover:underline font-medium">
                      Lupa kata sandi?
                    </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base h-11 rounded-md focus:border-primary"
                disabled={isLoading || !schoolForLogin}
              />
               <p className="text-xs text-muted-foreground pt-1">Untuk demo, gunakan kata sandi: <strong>password</strong></p>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-base py-3 h-12 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading || !schoolForLogin}>
              {isLoading ? <GraduationCap className="mr-2.5 h-5 w-5 animate-pulse" /> : <LogIn className="mr-2.5 h-5 w-5" />}
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pb-8 pt-4 bg-muted/30 border-t">
          <Link href="/login-by-school" className="text-sm text-primary hover:underline font-medium">
            Masuk ke sekolah lain?
          </Link>
          <Link href="/superadmin-access" className="text-sm text-primary hover:underline font-medium mt-1">
            Masuk sebagai Super Admin?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}