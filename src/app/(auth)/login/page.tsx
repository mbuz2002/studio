"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked, LogIn } from "lucide-react";
import Link from "next/link";
import type { FormEvent} from 'react';
import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

const roles: { value: UserRole; label: string }[] = [
  { value: "Admin", label: "Admin" },
  { value: "KepalaSekolah", label: "Kepala Sekolah" },
  { value: "WakaKurikulum", label: "Waka Kurikulum" },
  { value: "TataUsaha", label: "Tata Usaha" },
  { value: "Guru", label: "Guru" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("pengguna@sekolah.id"); // Default email
  const [selectedRole, setSelectedRole] = useState<UserRole>("WakaKurikulum"); // Default role

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email && selectedRole) {
      login(email, selectedRole);
    } else {
      // Basic validation feedback, can be improved with toasts
      alert("Harap isi email dan pilih peran.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mb-4 flex items-center justify-center text-primary">
          <BookMarked size={48} strokeWidth={1.5} />
        </div>
        <CardTitle className="text-3xl font-bold">EduAI Planner</CardTitle>
        <CardDescription>Selamat datang! Silakan masuk atau pilih peran untuk demo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email (Contoh)</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="anda@contoh.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Pilih Peran (untuk Demo)</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih peran Anda" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Lupa kata sandi?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" defaultValue="password" />
             <p className="text-xs text-muted-foreground">Kata sandi diabaikan untuk mode demo ini.</p>
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <LogIn className="mr-2 h-5 w-5" /> Masuk
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Daftar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
