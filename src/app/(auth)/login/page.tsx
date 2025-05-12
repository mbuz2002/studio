
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added import
import { GraduationCap, LogIn } from "lucide-react"; 
import Link from "next/link";
import type { FormEvent} from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import { APP_USERS_STORAGE_KEY } from "@/types"; // Import APP_USERS_STORAGE_KEY
import { useToast } from "@/hooks/use-toast";

const roles: { value: UserRole; label: string }[] = [
  { value: "Admin", label: "Admin Sekolah" },
  { value: "KepalaSekolah", label: "Kepala Sekolah" },
  { value: "WakaKurikulum", label: "Waka Kurikulum" },
  { value: "TataUsaha", label: "Tata Usaha" },
  { value: "Guru", label: "Guru" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); // Added password state
  const [selectedRole, setSelectedRole] = useState<UserRole>("Guru"); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email && selectedRole && password) { // Check password as well
      setIsLoading(true); 
      
      // In a real app, you'd send email, password, and selectedRole to a backend for verification.
      // For this demo, the AuthContext's login function handles finding the user by email
      // and then uses the selectedRole for demo flexibility (if user exists but role differs).
      // Password "password" is a placeholder for this demo.
      if (password === "password") { // Simplified password check for demo
        login(email, selectedRole);
      } else {
        toast({
          title: "Login Gagal",
          description: "Email atau kata sandi salah.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Data Tidak Lengkap",
        description: "Harap isi email, kata sandi, dan pilih peran.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-border/50">
        <CardHeader className="text-center pt-8 pb-6 bg-card">
          <div className="mb-5 flex items-center justify-center text-primary">
            <GraduationCap size={56} strokeWidth={1.5} className="text-primary drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">GUMPLA AI</CardTitle>
          <CardDescription className="text-base md:text-lg text-muted-foreground pt-1.5">
            Masuk untuk melanjutkan ke dasbor sekolah Anda.
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm font-medium text-foreground">Masuk Sebagai</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} disabled={isLoading}>
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
                <Link href="#" className="text-xs text-primary hover:underline font-medium">
                  Lupa kata sandi?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base h-11 rounded-md focus:border-primary" 
                disabled={isLoading} 
              />
               <p className="text-xs text-muted-foreground pt-1">Untuk demo, gunakan kata sandi: <strong>password</strong></p>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-base py-3 h-12 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading}>
              {isLoading ? <GraduationCap className="mr-2.5 h-5 w-5 animate-pulse" /> : <LogIn className="mr-2.5 h-5 w-5" />}
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pb-8 pt-4 bg-muted/30 border-t">
          <Link href="/signup" className="text-sm text-accent hover:underline font-medium">
              Belum punya akun sekolah? Daftar di sini.
          </Link>
          <Link href="/superadmin/login" className="text-sm text-primary hover:underline font-medium mt-1">
            Masuk sebagai Super Admin?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
