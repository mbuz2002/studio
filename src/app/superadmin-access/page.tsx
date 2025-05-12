
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
import { initialSuperAdminUser } from '@/lib/initial-data'; 
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Import useRouter

export default function SuperAdminAccessPage() {
  const { login, user, loading: authIsLoading } = useAuth(); // Get user and authIsLoading
  const { toast } = useToast();
  const router = useRouter(); // Initialize router
  const [username, setUsername] = useState("admin"); 
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    // Redirect if already logged in as SuperAdmin
    if (!authIsLoading && user?.role === "SuperAdmin") {
      router.push('/superadmin/dashboard');
    }
  }, [user, authIsLoading, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Call the login function from AuthContext.
    // AuthContext handles credential checking, success (redirect), and failure (toast).
    login(username, password, "SuperAdmin");

    // If login fails, AuthContext shows a toast. The SuperAdminLoginPage's
    // isLoading state needs to be reset because the page is still active.
    // We use a timeout. If login was successful, navigation would have occurred,
    // and this component would unmount, effectively clearing the timeout's effect.
    const timer = setTimeout(() => {
      // Check if still loading. This implies login failed and no navigation occurred.
      // This is a heuristic; a more robust solution would involve login returning a status.
      if (isLoading) { // Check if isLoading is still true from the component's perspective
         setIsLoading(false);
      }
    }, 2000); // Adjust timeout if necessary

    // No explicit clearTimeout needed here if successful login unmounts the component.
    // For a more robust solution, login should return a Promise.
  };

  // Prevent rendering form if already logged in and redirecting
  if (authIsLoading || (user?.role === "SuperAdmin" && typeof window !== "undefined" && window.location.pathname !== '/superadmin-access' )) {
    return (
       <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <Settings className="mr-2.5 h-10 w-10 animate-spin text-sky-400" />
        <p className="text-xl">Memuat...</p>
      </div>
    );
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
            Username Super Admin Demo: admin
          </p>
          <Link href="/login-by-school" className="text-sm text-sky-400 hover:underline font-medium mt-2">
            Bukan Super Admin? Masuk di sini.
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
