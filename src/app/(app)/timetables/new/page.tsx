
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { TimetableEntry, Subject, Teacher, SchoolClass } from "@/types";
import { TIMETABLES_STORAGE_KEY, SUBJECTS_STORAGE_KEY, TEACHERS_STORAGE_KEY, SCHOOL_CLASSES_STORAGE_KEY } from "@/types";

const daysOfWeek: TimetableEntry['dayOfWeek'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];


export default function NewTimetableEntryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<TimetableEntry>>({
    dayOfWeek: 'Senin',
    startTime: '07:00',
    endTime: '07:45',
    classOrGrade: '',
    subjectId: '',
    teacherId: '',
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role)) {
      toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk menambah entri jadwal.", variant: "destructive" });
      router.push("/timetables");
      return;
    }
    
    const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
    
    const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (storedTeachers) setTeachers(JSON.parse(storedTeachers));

    const storedClasses = localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY);
    if (storedClasses) setSchoolClasses(JSON.parse(storedClasses));
    
    addLog("INFO", `Pengguna ${user.email} mengakses halaman Tambah Entri Jadwal Baru.`, "NewTimetableEntryPage");

  }, [user, authLoading, router, toast, addLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: keyof TimetableEntry, value: string) => {
     // Check if the selected value is a placeholder and set to empty string if it is
    const placeholderValue = `placeholder-${name.toString()}`; // e.g., "placeholder-subjectId"
    const actualValue = value === placeholderValue ? "" : value;
    setFormData(prev => ({ ...prev, [name]: actualValue }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.subjectId || !formData.teacherId || !formData.classOrGrade) {
      toast({ title: "Data Tidak Lengkap", description: "Harap isi semua field yang wajib.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const newEntry: TimetableEntry = {
      id: `tt-${Date.now()}`,
      dayOfWeek: formData.dayOfWeek!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      subjectId: formData.subjectId!,
      teacherId: formData.teacherId!,
      classOrGrade: formData.classOrGrade!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: user?.id,
    };

    try {
      const existingEntries = JSON.parse(localStorage.getItem(TIMETABLES_STORAGE_KEY) || "[]") as TimetableEntry[];
      localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify([...existingEntries, newEntry]));
      toast({ title: "Entri Jadwal Ditambahkan", description: `Entri baru untuk ${newEntry.classOrGrade} pada hari ${newEntry.dayOfWeek} berhasil disimpan.` });
      addLog("INFO", `Entri jadwal baru untuk kelas ${newEntry.classOrGrade} ditambahkan oleh ${user?.email}.`, "NewTimetableEntryPage");
      router.push("/timetables"); 
    } catch (error) {
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan.", variant: "destructive" });
      addLog("ERROR", `Gagal menyimpan entri jadwal untuk ${newEntry.classOrGrade}. Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "NewTimetableEntryPage");
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ListChecks className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ListChecks className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Tambah Entri Jadwal Baru</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Masukkan detail untuk satu sesi pelajaran dalam jadwal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="classOrGrade">Kelas/Rombel</Label>
                <Select 
                  value={formData.classOrGrade || ""} 
                  onValueChange={(value) => handleSelectChange('classOrGrade', value)}
                >
                  <SelectTrigger id="classOrGrade">
                    <SelectValue placeholder="Pilih Kelas/Rombel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder-classOrGrade" disabled>Pilih Kelas/Rombel</SelectItem>
                    {schoolClasses.length === 0 && <SelectItem value="no-classes" disabled>Tidak ada data kelas</SelectItem>}
                    {schoolClasses.map(sc => (
                      <SelectItem key={sc.id} value={sc.name}>{sc.name} ({sc.gradeLevel})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dayOfWeek">Hari</Label>
                <Select 
                  value={formData.dayOfWeek || ""} 
                  onValueChange={(value) => handleSelectChange('dayOfWeek', value)}
                >
                  <SelectTrigger id="dayOfWeek"><SelectValue placeholder="Pilih Hari" /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="placeholder-dayOfWeek" disabled>Pilih Hari</SelectItem>
                    {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Waktu Mulai</Label>
                <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">Waktu Selesai</Label>
                <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subjectId">Mata Pelajaran</Label>
              <Select 
                value={formData.subjectId || ""} 
                onValueChange={(value) => handleSelectChange('subjectId', value)}
              >
                <SelectTrigger id="subjectId"><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-subjectId" disabled>Pilih Mata Pelajaran</SelectItem>
                  {subjects.length === 0 && <SelectItem value="no-subject" disabled>Tidak ada mapel</SelectItem>}
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacherId">Guru Pengampu</Label>
              <Select 
                value={formData.teacherId || ""} 
                onValueChange={(value) => handleSelectChange('teacherId', value)}
              >
                <SelectTrigger id="teacherId"><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="placeholder-teacherId" disabled>Pilih Guru</SelectItem>
                  {teachers.length === 0 && <SelectItem value="no-teacher" disabled>Tidak ada guru</SelectItem>}
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" /> Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Entri Jadwal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

