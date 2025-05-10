
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ListChecks, PlusCircle, Search, Printer, Filter, X, Edit2, Trash2, MoreHorizontal, ExternalLink, AlertTriangle, User, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import type { TimetableEntry, Subject, Teacher, SchoolClass, SchoolProfile, TeachingPeriodSettings } from "@/types";
import { TIMETABLES_STORAGE_KEY, SUBJECTS_STORAGE_KEY, TEACHERS_STORAGE_KEY, SCHOOL_CLASSES_STORAGE_KEY, SCHOOL_PROFILE_STORAGE_KEY, TEACHING_PERIOD_SETTINGS_KEY } from "@/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const daysOfWeekOrder: TimetableEntry['dayOfWeek'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

export default function TimetablesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useLog();
  const [isClient, setIsClient] = useState(false);

  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [teachingPeriodSettings, setTeachingPeriodSettings] = useState<TeachingPeriodSettings | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | "ALL">("ALL");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | "ALL">("ALL");
  const [selectedDay, setSelectedDay] = useState<TimetableEntry['dayOfWeek'] | "ALL">("ALL");


  useEffect(() => {
    setIsClient(true);
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    addLog("INFO", `Pengguna ${user.email} mengakses halaman Jadwal Pelajaran.`, "TimetablesPage");

    const loadData = () => {
      try {
        const storedEntries = localStorage.getItem(TIMETABLES_STORAGE_KEY);
        setTimetableEntries(storedEntries ? JSON.parse(storedEntries) : []);
        
        const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
        setSubjects(storedSubjects ? JSON.parse(storedSubjects) : []);
        
        const storedTeachers = localStorage.getItem(TEACHERS_STORAGE_KEY);
        setTeachers(storedTeachers ? JSON.parse(storedTeachers) : []);

        const storedClasses = localStorage.getItem(SCHOOL_CLASSES_STORAGE_KEY);
        setSchoolClasses(storedClasses ? JSON.parse(storedClasses) : []);
        
        const storedProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
        if (storedProfile) setSchoolProfile(JSON.parse(storedProfile));

        const storedJpSettings = localStorage.getItem(TEACHING_PERIOD_SETTINGS_KEY);
        if (storedJpSettings) setTeachingPeriodSettings(JSON.parse(storedJpSettings));

      } catch (e) {
        toast({ title: "Gagal Memuat Data Lokal", description: "Beberapa data mungkin tidak tampil benar.", variant: "destructive"});
        addLog("ERROR", `Gagal memuat data dari localStorage: ${e instanceof Error ? e.message : String(e)}`, "TimetablesPage");
      }
    };
    loadData();
  }, [user, authLoading, router, toast, addLog]);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const filteredTimetable = useMemo(() => {
    return timetableEntries
      .filter(entry => 
        (selectedClassId === "ALL" || entry.classOrGrade === schoolClasses.find(sc => sc.id === selectedClassId)?.name) &&
        (selectedTeacherId === "ALL" || entry.teacherId === selectedTeacherId) &&
        (selectedDay === "ALL" || entry.dayOfWeek === selectedDay) &&
        (searchTerm === "" || 
          (subjectMap.get(entry.subjectId) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (teacherMap.get(entry.teacherId) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.classOrGrade || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        const dayComparison = daysOfWeekOrder.indexOf(a.dayOfWeek) - daysOfWeekOrder.indexOf(b.dayOfWeek);
        if (dayComparison !== 0) return dayComparison;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [timetableEntries, selectedClassId, selectedTeacherId, selectedDay, searchTerm, subjectMap, teacherMap, schoolClasses]);

  const groupedTimetable = useMemo(() => {
    return filteredTimetable.reduce((acc, entry) => {
      const day = entry.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(entry);
      return acc;
    }, {} as Record<TimetableEntry['dayOfWeek'], TimetableEntry[]>);
  }, [filteredTimetable]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedClassId("ALL");
    setSelectedTeacherId("ALL");
    setSelectedDay("ALL");
    toast({ title: "Filter Direset" });
  }, [toast]);

  const activeFilterCount = [searchTerm, selectedClassId, selectedTeacherId, selectedDay].filter(f => f !== "" && f !== "ALL").length;

  const calculateTotalWeeklyJPForTeacher = useCallback((teacherId: string): number => {
    if (!teachingPeriodSettings?.jpDurationMinutes || teachingPeriodSettings.jpDurationMinutes <= 0) {
      return 0;
    }
    const jpDuration = teachingPeriodSettings.jpDurationMinutes;
    let totalJP = 0;
    timetableEntries.forEach(entry => {
      if (entry.teacherId === teacherId) {
        const startMinutes = parseTimeToMinutes(entry.startTime);
        const endMinutes = parseTimeToMinutes(entry.endTime);
        const durationMinutes = endMinutes - startMinutes;
        if (durationMinutes > 0) {
          totalJP += durationMinutes / jpDuration;
        }
      }
    });
    return Math.round(totalJP * 10) / 10; // Round to 1 decimal place
  }, [timetableEntries, teachingPeriodSettings]);

  const selectedTeacherTotalJP = useMemo(() => {
    if (selectedTeacherId !== "ALL" && teachingPeriodSettings?.jpDurationMinutes) {
      return calculateTotalWeeklyJPForTeacher(selectedTeacherId);
    }
    return null;
  }, [selectedTeacherId, calculateTotalWeeklyJPForTeacher, teachingPeriodSettings]);


  const handlePrint = () => {
    addLog("INFO", `Pengguna ${user?.email} mencetak jadwal pelajaran. Filter: Kelas=${selectedClassId}, Guru=${selectedTeacherId}, Hari=${selectedDay}.`, "TimetablesPage-Print");
    let printContent = `
      <html>
        <head>
          <title>Jadwal Pelajaran</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 0.5in; font-size: 10pt; }
            .kop-surat { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 4px double black; padding-bottom: 10px; min-height: 70px; }
            .logo-sekolah { max-height: 65px; max-width: 65px; margin-right: 15px; object-fit: contain; }
            .logo-placeholder { width: 65px; height: 65px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8pt; color: #666; margin-right: 15px;}
            .kop-text { text-align: center; flex-grow: 1; }
            .kop-text h1 { font-size: 14pt; margin: 0 0 2px 0; font-weight: bold; text-transform: uppercase; }
            .kop-text p { font-size: 9pt; margin: 1px 0; }
            h2 { text-align: center; font-size: 14pt; margin-bottom: 10px; text-transform: uppercase; }
            .filter-info { text-align: center; font-size: 10pt; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: center;}
            .day-header { font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 8px; background-color: #e0e0e0; padding: 5px; text-align: center; }
            .no-schedule { text-align: center; font-style: italic; color: #555; padding: 10px; }
            .print-button-container { display: none; } /* Hide button in print */
            @media print {
                .print-button-container { display: none; }
                 h1, h2, h3, h4, h5, table, ul, ol, p, div { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
    `;

    if (schoolProfile) {
        printContent += `
            <div class="kop-surat">
              ${schoolProfile.logoUrl ? `<img src="${schoolProfile.logoUrl}" alt="Logo Sekolah" class="logo-sekolah" data-ai-hint="school logo">` : '<div class="logo-placeholder">Logo Sekolah</div>'}
              <div class="kop-text">
                <h1>${schoolProfile.namaSekolah || 'Nama Sekolah'}</h1>
                <p>${schoolProfile.alamat || 'Alamat Sekolah'}</p>
                <p>
                  ${schoolProfile.npsn ? `NPSN: ${schoolProfile.npsn}` : ''}
                  ${schoolProfile.nomorTelepon ? `${schoolProfile.npsn ? ' | ' : ''}Telp: ${schoolProfile.nomorTelepon}` : ''}
                  ${schoolProfile.emailSekolah ? `${(schoolProfile.npsn || schoolProfile.nomorTelepon) ? ' | ' : ''}Email: ${schoolProfile.emailSekolah}` : ''}
                </p>
              </div>
            </div>
        `;
    }
    
    printContent += `<h2>Jadwal Pelajaran</h2>`;
    printContent += `<div class="filter-info">`;
    if (selectedClassId !== "ALL") printContent += `Kelas/Rombel: ${schoolClasses.find(sc => sc.id === selectedClassId)?.name || selectedClassId}<br>`;
    if (selectedTeacherId !== "ALL") printContent += `Guru: ${teachers.find(t => t.id === selectedTeacherId)?.name || selectedTeacherId}<br>`;
    if (selectedDay !== "ALL") printContent += `Hari: ${selectedDay}<br>`;
    if (searchTerm) printContent += `Pencarian: "${searchTerm}"<br>`;
    printContent += `</div>`;

    daysOfWeekOrder.forEach(day => {
        if (selectedDay !== "ALL" && day !== selectedDay) return;

        const entriesForDay = groupedTimetable[day];
        if (entriesForDay && entriesForDay.length > 0) {
            printContent += `<div class="day-header">${day}</div>`;
            printContent += `
                <table>
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Kelas/Rombel</th>
                            <th>Mata Pelajaran</th>
                            <th>Guru Pengampu</th>
                            ${teachingPeriodSettings?.jpDurationMinutes ? '<th>JP</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
            `;
            entriesForDay.forEach(entry => {
                let jpDisplay = '-';
                if (teachingPeriodSettings?.jpDurationMinutes && teachingPeriodSettings.jpDurationMinutes > 0) {
                    const startMinutes = parseTimeToMinutes(entry.startTime);
                    const endMinutes = parseTimeToMinutes(entry.endTime);
                    const durationMinutes = endMinutes - startMinutes;
                    if (durationMinutes > 0) {
                        jpDisplay = (durationMinutes / teachingPeriodSettings.jpDurationMinutes).toFixed(1);
                    }
                }
                printContent += `
                    <tr>
                        <td>${entry.startTime} - ${entry.endTime}</td>
                        <td>${entry.classOrGrade}</td>
                        <td>${subjectMap.get(entry.subjectId) || entry.subjectId}</td>
                        <td>${teacherMap.get(entry.teacherId) || entry.teacherId}</td>
                        ${teachingPeriodSettings?.jpDurationMinutes ? `<td>${jpDisplay}</td>` : ''}
                    </tr>
                `;
            });
            printContent += `</tbody></table>`;
        } else if (selectedDay === "ALL" || selectedDay === day) {
             printContent += `<div class="day-header">${day}</div><p class="no-schedule">Tidak ada jadwal untuk hari ini.</p>`;
        }
    });

    printContent += `
          <div class="print-button-container" style="text-align:center; margin-top:20px;">
            <button onclick="window.print()">Cetak Jadwal</button>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
  };
  
  const handleDeleteEntry = useCallback((entryId: string) => {
    const entryToDelete = timetableEntries.find(e => e.id === entryId);
    if (!entryToDelete) {
        toast({ title: "Error", description: "Jadwal tidak ditemukan untuk dihapus.", variant: "destructive" });
        return;
    }

    if (window.confirm(`Yakin ingin menghapus jadwal ${subjectMap.get(entryToDelete.subjectId) || 'Tanpa Nama'} kelas ${entryToDelete.classOrGrade} pada hari ${entryToDelete.dayOfWeek}?`)) {
        const updatedEntries = timetableEntries.filter(e => e.id !== entryId);
        setTimetableEntries(updatedEntries);
        localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(updatedEntries));
        toast({ title: "Entri Jadwal Dihapus" });
        addLog("WARN", `Entri jadwal (ID: ${entryId}) untuk kelas ${entryToDelete.classOrGrade} dihapus oleh ${user?.email}.`, "TimetablesPage");
    }
  }, [timetableEntries, subjectMap, user, toast, addLog, setTimetableEntries]);


  if (!isClient || authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <ListChecks className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Memuat jadwal pelajaran...</p>
      </div>
    );
  }

  const canManage = user && ["Admin", "KepalaSekolah", "WakaKurikulum"].includes(user.role);

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ListChecks className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Jadwal Pelajaran Sekolah</CardTitle>
              <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                Lihat dan kelola jadwal pelajaran untuk semua kelas dan guru.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {!teachingPeriodSettings?.jpDurationMinutes && canManage && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Pengaturan Durasi JP Belum Ditetapkan!</AlertTitle>
              <AlertDescription>
                Durasi untuk 1 Jam Pelajaran (JP) belum diatur. Ini diperlukan untuk perhitungan JP otomatis.
                Admin dapat mengaturnya di <Link href="/admin/system-settings" className="font-semibold underline hover:text-destructive-foreground/80">Pengaturan Sistem</Link>.
              </AlertDescription>
            </Alert>
          )}

          {selectedTeacherTotalJP !== null && (
            <Card className="mb-4 shadow-md rounded-md bg-secondary/30">
                <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary"/>
                        <CardTitle className="text-lg font-semibold">Total JP Mingguan Guru</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-base">
                        Guru: <span className="font-medium">{teacherMap.get(selectedTeacherId) || 'Tidak Diketahui'}</span>
                    </p>
                    <p className="text-base">
                        Total Jam Pelajaran per Minggu: <span className="font-bold text-lg text-primary">{selectedTeacherTotalJP.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:1})} JP</span>
                    </p>
                    {(!teachingPeriodSettings?.jpDurationMinutes || teachingPeriodSettings.jpDurationMinutes <= 0) && (
                        <p className="text-xs text-destructive mt-1">Durasi JP belum diatur. Hasil mungkin tidak akurat.</p>
                    )}
                </CardContent>
            </Card>
          )}


          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari (Mapel, Guru, Kelas)..."
                  className="pl-10 w-full text-base md:text-sm h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto text-base md:text-sm h-10">
                    <X className="mr-2 h-4 w-4" /> Reset Filter ({activeFilterCount})
                  </Button>
                )}
                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto text-base md:text-sm h-10">
                  <Printer className="mr-2 h-4 w-4" /> Cetak Jadwal Saat Ini
                </Button>
              </div>
               {canManage && (
                <div className="w-full md:w-auto">
                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
                    <Link href="/timetables/new">
                        <PlusCircle className="mr-2 h-5 w-5" /> Tambah Entri Jadwal
                    </Link>
                    </Button>
                </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                    <Label htmlFor="classFilter" className="text-xs">Filter Kelas/Rombel</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger id="classFilter" className="h-10 text-sm"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Kelas/Rombel</SelectItem>
                            {schoolClasses.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name} ({sc.gradeLevel})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="teacherFilter" className="text-xs">Filter Guru</Label>
                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                        <SelectTrigger id="teacherFilter" className="h-10 text-sm"><SelectValue placeholder="Semua Guru" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Guru</SelectItem>
                            {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="dayFilter" className="text-xs">Filter Hari</Label>
                    <Select value={selectedDay} onValueChange={(val) => setSelectedDay(val as TimetableEntry['dayOfWeek'] | "ALL")}>
                        <SelectTrigger id="dayFilter" className="h-10 text-sm"><SelectValue placeholder="Semua Hari" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Hari</SelectItem>
                            {daysOfWeekOrder.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedTimetable).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <ListChecks className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Tidak ada jadwal yang cocok dengan filter Anda.</p>
                </div>
            )}
            {daysOfWeekOrder.map(day => {
              const entriesForDay = groupedTimetable[day];
              if (!entriesForDay || entriesForDay.length === 0) {
                if (selectedDay === "ALL" || selectedDay === day) {
                    return (
                        <div key={day} className="mb-4">
                            <h3 className="text-lg font-semibold mb-2 p-2 bg-muted/50 rounded-md text-center">{day}</h3>
                            <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal untuk hari ini.</p>
                        </div>
                    );
                }
                return null;
              }
              return (
                <div key={day} className="mb-6 last:mb-0">
                  <h3 className="text-xl font-bold mb-3 p-3 bg-secondary/50 rounded-t-md text-center sticky top-0 z-10 shadow-sm">{day}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {entriesForDay.map(entry => {
                       let jpDisplay = '-';
                       if (teachingPeriodSettings?.jpDurationMinutes && teachingPeriodSettings.jpDurationMinutes > 0) {
                           const startMinutes = parseTimeToMinutes(entry.startTime);
                           const endMinutes = parseTimeToMinutes(entry.endTime);
                           const durationMinutes = endMinutes - startMinutes;
                           if (durationMinutes > 0) {
                               jpDisplay = (durationMinutes / teachingPeriodSettings.jpDurationMinutes).toFixed(1) + ' JP';
                           }
                       }
                      return (
                      <Card key={entry.id + entry.startTime} className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg flex flex-col">
                        <CardHeader className="p-4 bg-muted/30 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-semibold text-primary">
                              {entry.startTime} - {entry.endTime}
                            </CardTitle>
                            {jpDisplay !== '-' && <Badge variant="secondary" className="text-xs">{jpDisplay}</Badge>}
                          </div>
                          <CardDescription className="text-xs text-muted-foreground">
                            {entry.classOrGrade}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-1.5 flex-grow">
                          <p className="text-sm font-medium">{subjectMap.get(entry.subjectId) || entry.subjectId}</p>
                          <p className="text-xs text-muted-foreground">Guru: {teacherMap.get(entry.teacherId) || entry.teacherId}</p>
                        </CardContent>
                        {canManage && (
                            <CardContent className="p-3 border-t mt-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                                        <MoreHorizontal className="h-4 w-4 mr-1" /> Opsi
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/timetables/edit/${entry.id}`)} className="text-sm">
                                        <Edit2 className="mr-2 h-3 w-3" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)} className="text-destructive focus:text-destructive text-sm">
                                        <Trash2 className="mr-2 h-3 w-3" /> Hapus
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        )}
                      </Card>
                    )})}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

