
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { School } from '@/types';
import { SCHOOLS_STORAGE_KEY } from '@/types';
import { Building, LogIn } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Link from 'next/link';

// Helper to slugify school names for URL
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

export default function LoginBySchoolPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
    if (storedSchools) {
      setSchools(JSON.parse(storedSchools).filter((s: School) => s.isActive)); // Only show active schools
    }
    setIsLoading(false);
  }, []);

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.kotaSekolah && school.kotaSekolah.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSchoolSelectAndRedirect = () => {
    if (selectedSchoolId) {
      const selectedSchool = schools.find(s => s.id === selectedSchoolId);
      if (selectedSchool) {
        // Using ID for reliability as slug might not be unique or perfectly generated
        router.push(`/login?school=${selectedSchool.id}`); 
      }
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner message="Memuat daftar sekolah..." icon={<Building className="h-12 w-12 text-primary animate-pulse" />} />;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden border-border/50">
        <CardHeader className="text-center pt-8 pb-6 bg-card">
          <div className="mb-5 flex items-center justify-center text-primary">
            <Building size={56} strokeWidth={1.5} className="text-primary drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">Pilih Sekolah Anda</CardTitle>
          <CardDescription className="text-base md:text-lg text-muted-foreground pt-1.5">
            Temukan sekolah Anda untuk melanjutkan ke halaman login.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6 bg-card space-y-6">
          <div>
            <Label htmlFor="schoolSearch" className="text-sm font-medium text-foreground">Cari Nama Sekolah atau Kota</Label>
            <Input
              id="schoolSearch"
              type="text"
              placeholder="Ketik nama sekolah atau kota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1.5 text-base h-11 rounded-md focus:border-primary"
            />
          </div>
          
          {filteredSchools.length > 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="schoolSelect" className="text-sm font-medium text-foreground">Pilih Sekolah dari Daftar</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger id="schoolSelect" className="text-base h-11 rounded-md focus:border-primary">
                  <SelectValue placeholder="Pilih sekolah Anda" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSchools.map(school => (
                    <SelectItem key={school.id} value={school.id} className="text-base">
                      {school.name} {school.kotaSekolah ? `(${school.kotaSekolah})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {searchTerm ? "Sekolah tidak ditemukan." : "Tidak ada sekolah aktif yang terdaftar."}
            </p>
          )}

          <Button 
            onClick={handleSchoolSelectAndRedirect} 
            disabled={!selectedSchoolId}
            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground text-base py-3 h-12 rounded-md shadow-lg"
          >
            <LogIn className="mr-2.5 h-5 w-5" /> Lanjut ke Login Sekolah
          </Button>
        </CardContent>
         <CardFooter className="flex flex-col items-center space-y-3 pb-8 pt-4 bg-muted/30 border-t">
          <p className="text-sm text-muted-foreground">
            Sekolah Anda belum terdaftar?
          </p>
          <Link href="/signup" className="text-sm text-accent hover:underline font-medium">
              Daftarkan sekolah Anda di sini.
          </Link>
           <Link href="/superadmin-access" className="text-sm text-primary hover:underline font-medium mt-2">
            Masuk sebagai Super Admin?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
