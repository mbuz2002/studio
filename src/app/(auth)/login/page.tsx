
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked, LogIn, UserCircle, Loader2 } from "lucide-react"; 
import Link from "next/link";
import type { FormEvent} from 'react';
import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import Image from "next/image";

const roles: { value: UserRole; label: string }[] = [
  { value: "Admin", label: "Admin" },
  { value: "KepalaSekolah", label: "Kepala Sekolah" },
  { value: "WakaKurikulum", label: "Waka Kurikulum" },
  { value: "TataUsaha", label: "Tata Usaha" },
  { value: "Guru", label: "Guru" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("pengguna@sekolah.id"); 
  const [selectedRole, setSelectedRole] = useState<UserRole>("WakaKurikulum"); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email && selectedRole) {
      setIsLoading(true); 
      
      // Simulate a short delay for visual feedback if login is too fast for demo purposes
      // In a real app, login would be an async call.
      setTimeout(() => { 
        login(email, selectedRole);
        // setIsLoading(false); // Usually not needed here as login navigates away
      }, 300); 
    } else {
      alert("Harap isi email dan pilih peran.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-border/50">
        <CardHeader className="text-center pt-8 pb-6 bg-card">
          <div className="mb-5 flex items-center justify-center text-primary">
            
            <BookMarked size={56} strokeWidth={1.5} className="text-primary drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">EduAI Planner</CardTitle>
          <CardDescription className="text-base md:text-lg text-muted-foreground pt-1.5">
            Masuk untuk melanjutkan atau pilih peran untuk demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6 bg-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Alamat Email (Contoh)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="anda@contoh.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="text-base h-11 rounded-md focus:border-primary"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm font-medium text-foreground">Pilih Peran (Demo)</Label>
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
              <Input id="password" type="password" placeholder="••••••••" defaultValue="password" className="text-base h-11 rounded-md focus:border-primary" disabled={isLoading} />
               <p className="text-xs text-muted-foreground pt-1">Kata sandi diabaikan untuk mode demo ini.</p>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-base py-3 h-12 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2.5 h-5 w-5 animate-spin" /> : <LogIn className="mr-2.5 h-5 w-5" />}
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pb-8 pt-4 bg-muted/30 border-t">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="#" className="font-semibold text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
