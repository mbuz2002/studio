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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; 
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function SuperAdminAccessPage() {
  const { login, user, loading: authIsLoading } = useAuth(); 
  const { toast } = useToast(); // Kept for consistency, though login errors are handled in AuthContext
  const router = useRouter(); 
  const [username, setUsername] = useState("admin"); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    if (!authIsLoading && user?.role === "SuperAdmin") {
      router.push('/superadmin/dashboard');
    }
  }, [user, authIsLoading, router]);

  useEffect(() => {
    // If login was successful (user context updated), and we were in a loading state, reset it.
    if (user?.role === "SuperAdmin" && isLoading) {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    login("admin", password, "SuperAdmin");

    const timer = setTimeout(() => {
      // Check if still loading (i.e., not navigated away by successful login)
      // and also check if the current user is not SuperAdmin (meaning login actually failed)
      if (isLoading && user?.role !== "SuperAdmin") { 
         setIsLoading(false); 
      }
    }, 1500); // Reduced timeout
    return () => clearTimeout(timer);
  };

  if (authIsLoading) {
    return <LoadingSpinner message="Memverifikasi sesi..." icon={<Settings className="mr-2.5 h-10 w-10 animate-spin text-sky-400" />} />;
  }
  if (user?.role === "SuperAdmin") {
      return <LoadingSpinner message="Mengarahkan ke dasbor Super Admin..." icon={<Settings className="mr-2.5 h-10 w-10 animate-spin text-sky-400" />} />;
  }


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
              <Label htmlFor="username-sa" className="text-sm font-medium text-slate-300">Nama Pengguna Super Admin</Label>
              <Input 
                id="username-sa" 
                type="text" 
                placeholder="admin" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base h-11 rounded-md bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500" 
                disabled={isLoading} 
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-base py-3 h-12 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={isLoading}>
              {isLoading ? <Settings className="mr-2.5 h-5 w-5 animate-spin" /> : <LogIn className="mr-2.5 h-5 w-5" />}
              {isLoading ? "Memproses..." : "Masuk sebagai Super Admin"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pb-8 pt-4 border-t border-slate-700">
           <p className="text-sm text-slate-400">
            Username Super Admin Demo: <strong>admin</strong>
          </p>
           <p className="text-sm text-slate-400">
            Password Super Admin Demo: <strong>Payaman123</strong>
          </p>
          <Link href="/login-by-school" className="text-sm text-sky-400 hover:underline font-medium mt-2">
            Bukan Super Admin? Masuk di sini.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}