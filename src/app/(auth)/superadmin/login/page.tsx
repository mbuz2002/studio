
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, LogIn, Settings } from "lucide-react"; 
import Link from "next/link";
import type { FormEvent} from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { initialSuperAdminUser } from '@/lib/initial-data'; // Import initial SuperAdmin

export default function SuperAdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    // Pre-fill email for SuperAdmin for demo convenience
    setEmail(initialSuperAdminUser.email);
  }, []);


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email) {
      setIsLoading(true); 
      
      setTimeout(() => { 
        // Attempt login with SuperAdmin role explicitly
        login(email, "SuperAdmin"); 
        // setIsLoading(false); // Login will redirect
      }, 300); 
    } else {
      alert("Harap isi alamat email Super Admin.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-slate-700 bg-slate-800/70 backdrop-blur-md">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mb-5 flex items-center justify-center text-sky-400">
            <ShieldCheck size={56} strokeWidth={1.5} className="drop-shadow-[0_0_8px_theme(colors.sky.500)]" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-slate-50">GUMPLA AI</CardTitle>
          <CardDescription className="text-base md:text-lg text-slate-400 pt-1.5">
            Halaman Login Super Administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email-sa" className="text-sm font-medium text-slate-300">Email Super Admin</Label>
              <Input 
                id="email-sa" 
                type="email" 
                placeholder="superadmin@app.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="text-base h-11 rounded-md bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password-sa" className="text-sm font-medium text-slate-300">Kata Sandi</Label>
              <Input 
                id="password-sa" 
                type="password" 
                placeholder="••••••••" 
                defaultValue="superadminpassword" // Default for demo
                className="text-base h-11 rounded-md bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500" 
                disabled={isLoading} 
              />
               <p className="text-xs text-slate-500 pt-1">Kata sandi diabaikan untuk mode demo ini.</p>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-base py-3 h-12 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading}>
              {isLoading ? <Settings className="mr-2.5 h-5 w-5 animate-spin" /> : <LogIn className="mr-2.5 h-5 w-5" />}
              {isLoading ? "Memproses..." : "Masuk sebagai Super Admin"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pb-8 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Email Super Admin Demo: {initialSuperAdminUser.email}
          </p>
          <Link href="/login" className="text-sm text-sky-400 hover:underline font-medium mt-2">
            Bukan Super Admin? Masuk di sini.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
