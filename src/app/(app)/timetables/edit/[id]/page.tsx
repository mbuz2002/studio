
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Save, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { TimetableEntry, Subject, Teacher, SchoolClass } from "@/types";
import { TIMETABLES_STORAGE_KEY, SUBJECTS_STORAGE_KEY, TEACHERS_STORAGE_KEY, SCHOOL_CLASSES_STORAGE_KEY } from "@/types";

const daysOfWeek: TimetableEntry['dayOfWeek'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function EditTimetableEntryPage() {
  const router = useRouter();
  const params = useParams();
  const { id: entryId } = params;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [formData, setFormData] = useState<Partial<TimetableEntry>>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role)) {
      toast({ title: "Akses Ditolak", variant: "destructive" });
      router.push("/timetables");
      return;
    }

    const loadData = () => {
      try {
        const storedEntries = localStorage.getItem(TIMETABLES_STORAGE_KEY);
        if (storedEntries) {
          const entries: TimetableEntry[] = JSON.parse(storedEntries);
          const entryToEdit = entries.find(e => e.id === entryId);
          if (entryToEdit) {
            setFormData(entryToEdit);
            addLog("INFO", `Memuat entri jadwal (ID: ${entryId}) untuk diedit oleh ${user.email}.`, "EditTimetableEntryPage");
          } else {
            toast({ title: "Entri Jadwal Tidak Ditemukan", variant: "destructive" });
            router.push("/timetables");
            return;
          }
        } else {
            toast({ title: "Data Jadwal Tidak Ada", variant: "destructive" });
            router.push("/timetables");
            return;
        }
        
        const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
        setSubjects(storedSubjects ? JSON.parse(storedSubjects) : []);
        
        const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
        setTeachers(storedTeachers ? JSON.parse(storedTeachers) : []);

        const storedClasses = localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY);
        setSchoolClasses(storedClasses ? JSON.parse(storedClasses) : []);
        
      } catch (e) {
        toast({ title: "Gagal Memuat Data", variant: "destructive"});
        addLog("ERROR", `Gagal memuat data untuk edit jadwal: ${e instanceof Error ? e.message : String(e)}`, "EditTimetableEntryPage");
        router.push("/timetables");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, authLoading, router, toast, addLog, entryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: keyof TimetableEntry, value: string) => {
    const placeholderValue = `placeholder-${name.toString()}`;
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

    const updatedEntry: TimetableEntry = {
      ...formData,
      updatedAt: new Date().toISOString(),
    } as TimetableEntry;

    try {
      const existingEntries = JSON.parse(localStorage.getItem(TIMETABLES_STORAGE_KEY) || "[]") as TimetableEntry[];
      const updatedEntries = existingEntries.map(e => e.id === entryId ? updatedEntry : e);
      localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(updatedEntries));
      toast({ title: "Entri Jadwal Diperbarui", description: `Jadwal untuk ${updatedEntry.classOrGrade} berhasil diperbarui.` });
      addLog("INFO", `Entri jadwal (ID: ${entryId}) untuk kelas ${updatedEntry.classOrGrade} diperbarui oleh ${user?.email}.`, "EditTimetableEntryPage");
      router.push("/timetables");
    } catch (error) {
      toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan.", variant: "destructive" });
      addLog("ERROR", `Gagal memperbarui entri jadwal (ID: ${entryId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditTimetableEntryPage");
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
     if (window.confirm(`Apakah Anda yakin ingin menghapus entri jadwal ini?`)) {
      try {
        const existingEntries = JSON.parse(localStorage.getItem(TIMETABLES_STORAGE_KEY) || "[]") as TimetableEntry[];
        const updatedEntries = existingEntries.filter(p => p.id !== entryId);
        localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(updatedEntries));
        toast({ title: "Entri Jadwal Dihapus", description: `Entri jadwal telah berhasil dihapus.` });
        addLog("WARN", `Entri jadwal (ID: ${entryId}) dihapus oleh ${user?.email}.`, "EditTimetableEntryPage");
        router.push("/timetables");
      } catch (error) {
        toast({ title: "Gagal Menghapus", variant: "destructive" });
         addLog("ERROR", `Gagal menghapus entri jadwal (ID: ${entryId}). Kesalahan: ${error instanceof Error ? error.message : String(error)}`, "EditTimetableEntryPage");
      }
    }
  };

  if (isLoading || authLoading || !user || !formData.id) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ListChecks className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat data entri jadwal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
             <div className="flex items-center gap-3">
                <ListChecks className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
                <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Edit Entri Jadwal</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1 truncate max-w-md">
                    {subjects.find(s=>s.id === formData.subjectId)?.name} - {formData.classOrGrade} - {formData.dayOfWeek}
                </CardDescription>
                </div>
            </div>
            <Button variant="destructive" onClick={handleDelete} className="w-full mt-2 sm:mt-0 sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Entri Ini
            </Button>
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
                  name="classOrGrade"
                >
                  <SelectTrigger id="classOrGrade">
                    <SelectValue placeholder="Pilih Kelas/Rombel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder-classOrGrade" disabled>Pilih Kelas/Rombel</SelectItem>
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
                  name="dayOfWeek"
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
                <Input id="startTime" name="startTime" type="time" value={formData.startTime || ""} onChange={handleChange} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">Waktu Selesai</Label>
                <Input id="endTime" name="endTime" type="time" value={formData.endTime || ""} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subjectId">Mata Pelajaran</Label>
              <Select 
                value={formData.subjectId || ""} 
                onValueChange={(value) => handleSelectChange('subjectId', value)}
                name="subjectId"
              >
                <SelectTrigger id="subjectId"><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-subjectId" disabled>Pilih Mata Pelajaran</SelectItem>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacherId">Guru Pengampu</Label>
              <Select 
                value={formData.teacherId || ""} 
                onValueChange={(value) => handleSelectChange('teacherId', value)}
                name="teacherId"
              >
                <SelectTrigger id="teacherId"><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder-teacherId" disabled>Pilih Guru</SelectItem>
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
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
