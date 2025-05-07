"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookMarked, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import type { FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here
    // For now, redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mb-4 flex items-center justify-center text-primary">
          <BookMarked size={48} strokeWidth={1.5} />
        </div>
        <CardTitle className="text-3xl font-bold">EduAI Planner</CardTitle>
        <CardDescription>Selamat datang kembali! Silakan masuk ke akun Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" type="email" placeholder="anda@contoh.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Lupa kata sandi?
              </Link>
            </div>
            <Input id="password" type="password" required placeholder="••••••••" />
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
