
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarCheck, PlusCircle, Edit2, Trash2, Printer } from "lucide-react";
import type { DateRange, DayPickerProps, SelectSingleEventHandler } from "react-day-picker";
import { format, parseISO, isValid, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { id as indonesianLocale } from 'date-fns/locale';
import type { AcademicEvent, AcademicEventType, UserRole, SchoolProfile } from "@/types";
import { ACADEMIC_EVENTS_STORAGE_KEY, SCHOOL_PROFILE_STORAGE_KEY } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const eventTypes: { value: AcademicEventType; label: string; color: string }[] = [
  { value: "Libur Nasional", label: "Libur Nasional", color: "bg-red-500" },
  { value: "Libur Semester", label: "Libur Semester", color: "bg-red-400" },
  { value: "Periode Semester Aktif", label: "Periode Semester Aktif", color: "bg-green-600" },
  { value: "Ujian Sekolah", label: "Ujian Sekolah", color: "bg-yellow-500" },
  { value: "Kegiatan Sekolah", label: "Kegiatan Sekolah", color: "bg-blue-500" },
  { value: "Tanggal Penting", label: "Tanggal Penting", color: "bg-green-500" },
  { value: "Lainnya", label: "Lainnya", color: "bg-gray-500" },
];

const getEventTypeColor = (type: AcademicEventType): string => {
  return eventTypes.find(et => et.value === type)?.color || "bg-gray-500";
};

const initialAcademicEvents: AcademicEvent[] = [];

const generatePrintableCalendarTableHtml = (
  month: Date,
  events: AcademicEvent[],
  schoolProfile: SchoolProfile | null,
  userName?: string
): string => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthName = format(month, "MMMM yyyy", { locale: indonesianLocale });

  let html = `<html><head><title>Kalender Pendidikan - ${monthName}</title><style>
    body { font-family: 'Times New Roman', Times, serif; margin: 0.5in; font-size: 10pt; }
    .kop-surat { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 4px double black; padding-bottom: 10px; min-height: 70px; }
    .logo-sekolah { max-height: 65px; max-width: 65px; margin-right: 15px; object-fit: contain; }
    .logo-placeholder { width: 65px; height: 65px; border: 1px dashed #999; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8pt; color: #666; margin-right: 15px;}
    .kop-text { text-align: center; flex-grow: 1; }
    .kop-text h1 { font-size: 14pt; margin: 0 0 2px 0; font-weight: bold; text-transform: uppercase; }
    .kop-text p { font-size: 9pt; margin: 1px 0; }
    h2 { text-align: center; font-size: 14pt; margin-bottom: 10px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; table-layout: fixed; }
    th, td { border: 1px solid black; padding: 4px; text-align: left; vertical-align: top; height: 70px; word-wrap: break-word; }
    th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
    td div.day-number { font-weight: bold; margin-bottom: 3px; font-size: 9pt; }
    td ul { margin: 0; padding-left: 12px; font-size: 8pt; list-style-type: none; }
    td li { margin-bottom: 1px; white-space: normal; }
    .event-holiday { color: red; font-weight: bold; }
    .event-semester-holiday { color: darkorange; }
    .event-active-semester-text { font-style: italic; color: #228B22; } /* ForestGreen */
    td.event-active-semester-bg { background-color: #e8f5e9; } /* Light green background for cell */
    .weekend { background-color: #f0f0f0; }
    .other-month { background-color: #f9f9f9; color: #ccc; }
    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .signature-block { width: 45%; text-align: center; }
    .signature-name { font-weight: bold; text-decoration: underline; }
    @media print { .print-button-container { display: none; } h1, h2, h3, h4, h5, table, ul, ol, p, div { page-break-inside: avoid; } }
  </style></head><body>`;

  if (schoolProfile) {
    html += `<div class="kop-surat">
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
    </div>`;
  }

  html += `<h2>Kalender Pendidikan - ${monthName}</h2>`;
  html += `<table><thead><tr><th>Sen</th><th>Sel</th><th>Rab</th><th>Kam</th><th>Jum</th><th>Sab</th><th>Min</th></tr></thead><tbody>`;

  const firstOfMonth = startOfMonth(month);
  const daysInCurrentMonth = getDaysInMonth(month);
  
  // Adjust to start week on Monday (0 for Sunday, 1 for Monday, etc.)
  // getDay() returns 0 for Sunday.
  let dayOfWeekOfFirst = getDay(firstOfMonth); // 0 for Sun, 1 for Mon
  let startingOffset = (dayOfWeekOfFirst === 0) ? 6 : dayOfWeekOfFirst - 1; // 0 for Mon, ..., 6 for Sun

  let dayCounter = 1;
  for (let i = 0; i < 6; i++) { // Max 6 weeks for a month
    html += `<tr>`;
    for (let j = 0; j < 7; j++) { // 7 days a week (Mon to Sun)
      if ((i === 0 && j < startingOffset) || dayCounter > daysInCurrentMonth) {
        html += `<td class="other-month"></td>`;
      } else {
        const currentDate = new Date(year, monthIndex, dayCounter);
        const formattedCurrentDate = format(currentDate, "yyyy-MM-dd");
        let cellClass = '';
        if (j === 5 || j === 6) cellClass += ' weekend'; // Saturday or Sunday

        const dayEvents = events.filter(event => {
          const eventStartDate = format(parseISO(event.date), "yyyy-MM-dd");
          if (event.endDate) {
            const eventEndDate = format(parseISO(event.endDate), "yyyy-MM-dd");
            return formattedCurrentDate >= eventStartDate && formattedCurrentDate <= eventEndDate;
          }
          return eventStartDate === formattedCurrentDate;
        });

        let eventHtml = '<ul>';
        dayEvents.forEach(event => {
          let eventClass = '';
          if (event.type === "Libur Nasional") eventClass = 'event-holiday';
          else if (event.type === "Libur Semester") eventClass = 'event-semester-holiday';
          else if (event.type === "Periode Semester Aktif") eventClass = 'event-active-semester-text';
          
          eventHtml += `<li class="${eventClass}">${event.title}</li>`;
        });
        eventHtml += '</ul>';
        
        if (dayEvents.some(e => e.type === 'Periode Semester Aktif') && !cellClass.includes('event-active-semester-bg')) {
            cellClass += ' event-active-semester-bg';
        }

        html += `<td class="${cellClass.trim()}">
                    <div class="day-number">${dayCounter}</div>
                    ${eventHtml}
                  </td>`;
        dayCounter++;
      }
    }
    html += `</tr>`;
    if (dayCounter > daysInCurrentMonth) break;
  }
  html += `</tbody></table>`;

  html += `<div class="signature-section">
    <div class="signature-block">
      <p>Mengetahui,</p>
      <p>Kepala Sekolah</p>
      <br><br><br>
      <p class="signature-name">${(schoolProfile?.namaKepalaSekolah || '(.........................................)')}</p>
      ${schoolProfile?.npsn ? `<p class="signature-nip">NIP/NPSN: ${schoolProfile.npsn}</p>` : ''}
    </div>
    <div class="signature-block">
      <p>${schoolProfile?.kotaSekolah || "Kota"}, ${format(new Date(), "dd MMMM yyyy", { locale: indonesianLocale })}</p>
      <p>${userName || 'Pembuat Laporan'}</p>
      <br><br><br>
      <p class="signature-name">${userName || '(.........................................)'}</p>
    </div>
  </div>`;

  html += `<div class="print-button-container"><button onclick="window.print()">Cetak</button></div></body></html>`;
  return html;
};


export default function AcademicCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<AcademicEvent[]>(initialAcademicEvents);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [newEventData, setNewEventData] = useState<Partial<AcademicEvent>>({
    title: "",
    date: format(selectedDate || new Date(), "yyyy-MM-dd"),
    type: "Kegiatan Sekolah",
    description: "",
  });

  useEffect(() => {
    setIsClient(true);
    if (user && !authLoading) {
        addLog("INFO", `Pengguna ${user.email} mengakses halaman Kalender Pendidikan.`, "AcademicCalendarPage");
    }
    const storedEvents = localStorage.getItem(ACADEMIC_EVENTS_STORAGE_KEY);
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents).map((e: AcademicEvent) => ({...e, date: e.date ? format(parseISO(e.date), 'yyyy-MM-dd') : ''})));
      } catch (error) {
        console.error("Gagal memuat acara dari localStorage:", error);
        setEvents(initialAcademicEvents);
      }
    } else {
      setEvents(initialAcademicEvents);
    }
    const storedProfile = localStorage.getItem(SCHOOL_PROFILE_STORAGE_KEY);
    if (storedProfile) {
        try {
            setSchoolProfile(JSON.parse(storedProfile));
        } catch (error) {
            console.error("Gagal memuat profil sekolah dari localStorage:", error);
        }
    }
  }, [user, authLoading, addLog]);

  const canManageEvents = user && (user.role === "Admin" || user.role === "KepalaSekolah" || user.role === "WakaKurikulum");

  const handleDayClick: SelectSingleEventHandler = (day) => {
    setSelectedDate(day);
  };

  const handleAddEventClick = () => {
    setEditingEvent(null);
    setNewEventData({
      title: "",
      date: format(selectedDate || new Date(), "yyyy-MM-dd"),
      type: "Kegiatan Sekolah",
      description: "",
    });
    setIsFormOpen(true);
  };

  const handleEditEventClick = (event: AcademicEvent) => {
    setEditingEvent(event);
    setNewEventData({ ...event, date: event.date ? format(parseISO(event.date), 'yyyy-MM-dd') : '' });
    setIsFormOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem(ACADEMIC_EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
    toast({ title: "Acara Dihapus", description: `Acara "${eventToDelete.title}" telah dihapus.` });
    addLog("WARN", `Acara "${eventToDelete.title}" (ID: ${eventId}) dihapus oleh ${user?.email}.`, "AcademicCalendarPage");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title || !newEventData.date || !newEventData.type) {
      toast({ title: "Data Tidak Lengkap", description: "Judul, tanggal, dan jenis acara wajib diisi.", variant: "destructive" });
      return;
    }
    if (newEventData.endDate && newEventData.date && newEventData.endDate < newEventData.date) {
      toast({ title: "Tanggal Tidak Valid", description: "Tanggal selesai tidak boleh sebelum tanggal mulai.", variant: "destructive" });
      return;
    }

    let updatedEvents;
    if (editingEvent) {
      const updatedEvent = { ...editingEvent, ...newEventData, updatedAt: new Date().toISOString() } as AcademicEvent;
      updatedEvents = events.map((event) => (event.id === editingEvent.id ? updatedEvent : event));
      toast({ title: "Acara Diperbarui", description: `Acara "${updatedEvent.title}" telah diperbarui.` });
      addLog("INFO", `Acara "${updatedEvent.title}" (ID: ${updatedEvent.id}) diperbarui oleh ${user?.email}.`, "AcademicCalendarPage");
    } else {
      const newId = `event-${Date.now()}`;
      const newCalendarEvent: AcademicEvent = {
        id: newId,
        title: newEventData.title!,
        date: format(parseISO(newEventData.date!), "yyyy-MM-dd"),
        endDate: newEventData.endDate ? format(parseISO(newEventData.endDate), "yyyy-MM-dd") : undefined,
        type: newEventData.type!,
        description: newEventData.description,
        isNationalHoliday: newEventData.type === 'Libur Nasional' ? newEventData.isNationalHoliday : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserId: user?.id,
      };
      updatedEvents = [...events, newCalendarEvent];
      toast({ title: "Acara Ditambahkan", description: `Acara "${newCalendarEvent.title}" telah ditambahkan.` });
      addLog("INFO", `Acara baru "${newCalendarEvent.title}" ditambahkan oleh ${user?.email}.`, "AcademicCalendarPage");
    }
    setEvents(updatedEvents);
    localStorage.setItem(ACADEMIC_EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
    setIsFormOpen(false);
    setEditingEvent(null);
  };
  
  const eventDateStrings = useMemo(() => events.map(event => event.date), [events]);
  const eventDatesForBorder = useMemo(() => eventDateStrings.map(dateStr => parseISO(dateStr)).filter(date => isValid(date)), [eventDateStrings]);

  const getDatesAndRangesForType = useCallback((eventType: AcademicEventType): (Date | DateRange)[] => {
    const datesAndRanges: (Date | DateRange)[] = [];
    events.filter(event => event.type === eventType).forEach(event => {
      const startDate = parseISO(event.date);
      if (isValid(startDate)) {
        if (event.endDate) {
          const endDateValue = parseISO(event.endDate);
          if (isValid(endDateValue) && endDateValue >= startDate) {
            datesAndRanges.push({ from: startDate, to: endDateValue });
          } else {
            datesAndRanges.push(startDate); 
          }
        } else {
          datesAndRanges.push(startDate);
        }
      }
    });
    return datesAndRanges;
  }, [events]);

  const nationalHolidayDates = useMemo(() => getDatesAndRangesForType("Libur Nasional"), [getDatesAndRangesForType]);
  const semesterHolidayDates = useMemo(() => getDatesAndRangesForType("Libur Semester"), [getDatesAndRangesForType]);
  const activeSemesterPeriodDates = useMemo(() => getDatesAndRangesForType("Periode Semester Aktif"), [getDatesAndRangesForType]);


  const modifiers: DayPickerProps['modifiers'] = {
    eventDay: eventDatesForBorder, 
    nationalHoliday: nationalHolidayDates,
    semesterHoliday: semesterHolidayDates,
    activeSemesterPeriod: activeSemesterPeriodDates,
  };

  const modifiersStyles: DayPickerProps['modifiersStyles'] = {
    eventDay: { 
      border: `2px solid hsl(var(--primary))`,
      borderRadius: '8px',
    },
    nationalHoliday: {
      backgroundColor: 'hsl(var(--destructive))', 
      color: 'hsl(var(--destructive-foreground))', 
      borderRadius: '8px',
      fontWeight: 'bold',
    },
    semesterHoliday: {
      backgroundColor: 'hsl(0 75% 65%)', 
      color: 'hsl(var(--destructive-foreground))',
      borderRadius: '8px',
      fontWeight: 'bold',
    },
    activeSemesterPeriod: {
      backgroundColor: 'hsla(var(--accent-hsl), 0.15)', // Light accent color, assuming --accent-hsl is defined in globals.css
      // Example: if accent is 250 65% 60%, then accent-hsl would be 250 65% 60%
      // To use this, ensure your globals.css has: --accent-hsl: 250 65% 60%; (or your chosen accent HSL values)
      // Alternatively, use a direct color: backgroundColor: 'rgba(128, 90, 213, 0.15)' if accent is a violet-like color
      // For a green: backgroundColor: 'rgba(76, 175, 80, 0.15)',
      borderRadius: '0px', // For continuous range appearance
    }
  };

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
    return events.filter(event => {
      const eventStartDate = format(parseISO(event.date), "yyyy-MM-dd");
      if (event.endDate) {
        const eventEndDate = format(parseISO(event.endDate), "yyyy-MM-dd");
        return formattedSelectedDate >= eventStartDate && formattedSelectedDate <= eventEndDate;
      }
      return eventStartDate === formattedSelectedDate;
    });
  }, [selectedDate, events]);
  
   const handlePrintTable = () => {
    const userName = user?.name || user?.email || "Pengguna";
    const printableHtml = generatePrintableCalendarTableHtml(currentMonth, events, schoolProfile, userName);
    const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    if (printWindow) {
        printWindow.document.write(printableHtml);
        printWindow.document.close();
    } else {
        toast({ title: "Gagal Membuka Jendela Cetak", description: "Mohon izinkan pop-up untuk situs ini.", variant: "destructive" });
    }
    addLog("INFO", `Pengguna ${user?.email} mencetak Kalender Pendidikan (format tabel) untuk bulan ${format(currentMonth, "MMMM yyyy")}.`, "AcademicCalendarPage");
  };


  if (!isClient || authLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <CalendarCheck className="h-12 w-12 animate-pulse text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Memuat Kalender Pendidikan...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Kalender Pendidikan</CardTitle>
                <CardDescription className="text-base md:text-lg text-primary-foreground/90 mt-1">
                  Lihat dan kelola jadwal kegiatan akademik dan hari libur sekolah.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Button onClick={handlePrintTable} variant="outline" className="bg-background/20 hover:bg-background/30 text-primary-foreground w-full sm:w-auto shadow-md">
                    <Printer className="mr-2 h-5 w-5" /> Cetak Tabel Bulanan
                </Button>
                {canManageEvents && (
                <Button onClick={handleAddEventClick} className="bg-background/20 hover:bg-background/30 text-primary-foreground w-full sm:w-auto shadow-md">
                    <PlusCircle className="mr-2 h-5 w-5" /> Tambah Acara Baru
                </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={indonesianLocale}
              className="rounded-md border shadow-md p-2 sm:p-4 bg-card"
              classNames={{
                  caption_label: "text-lg font-semibold",
                  head_cell: "text-muted-foreground w-10 sm:w-12 text-sm",
                  cell: "h-10 w-10 sm:h-12 sm:w-12 text-center text-sm p-0 relative",
                  day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal rounded-md hover:bg-accent/50", 
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary rounded-md",
                  day_today: "bg-accent text-accent-foreground rounded-md",
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="shadow-md rounded-lg">
              <CardHeader className="bg-muted/50 rounded-t-lg p-4">
                <CardTitle className="text-lg font-semibold">
                  Acara pada {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: indonesianLocale }) : "Pilih Tanggal"}
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[300px] sm:h-[350px] lg:h-[400px]">
                <CardContent className="p-4 space-y-3">
                  {eventsOnSelectedDate.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada acara pada tanggal ini.</p>
                  ) : (
                    eventsOnSelectedDate.map((event) => (
                      <div key={event.id} className="p-3 rounded-md border bg-background/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-block h-3 w-3 rounded-full ${getEventTypeColor(event.type)} flex-shrink-0`}></span>
                                <h4 className="font-semibold text-sm text-primary break-words">{event.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {event.endDate && event.date !== event.endDate 
                                    ? `${format(parseISO(event.date), 'dd MMM', {locale: indonesianLocale})} - ${format(parseISO(event.endDate), 'dd MMM yyyy', {locale: indonesianLocale})}` 
                                    : format(parseISO(event.date), 'dd MMMM yyyy', {locale: indonesianLocale})}
                            </p>
                             <Badge variant="outline" className="text-xs mt-1">{event.type}</Badge>
                          </div>
                           {canManageEvents && (
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditEventClick(event)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus acara "{event.title}"? Aksi ini tidak dapat diurungkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                        </div>
                        {event.description && <p className="text-xs mt-1.5 text-foreground/80 break-words">{event.description}</p>}
                      </div>
                    ))
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Acara" : "Tambah Acara Baru"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Perbarui detail acara." : "Masukkan detail untuk acara baru di kalender pendidikan."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventTitle">Judul Acara</Label>
              <Input id="eventTitle" value={newEventData.title || ""} onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="eventDate">Tanggal Mulai</Label>
                    <Input id="eventDate" type="date" value={newEventData.date || ''} onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="eventEndDate">Tanggal Selesai (Opsional)</Label>
                    <Input id="eventEndDate" type="date" value={newEventData.endDate || ''} onChange={(e) => setNewEventData({ ...newEventData, endDate: e.target.value })} min={newEventData.date}/>
                </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eventType">Jenis Acara</Label>
              <Select value={newEventData.type || ""} onValueChange={(value) => setNewEventData({ ...newEventData, type: value as AcademicEventType })}>
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Pilih Jenis Acara" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newEventData.type === 'Libur Nasional' && (
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="isNationalHoliday" 
                        checked={newEventData.isNationalHoliday || false} 
                        onCheckedChange={(checked) => setNewEventData({...newEventData, isNationalHoliday: Boolean(checked)})}
                    />
                    <Label htmlFor="isNationalHoliday" className="text-sm font-normal">Ini adalah Libur Nasional Resmi</Label>
                </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="eventDescription">Deskripsi (Opsional)</Label>
              <Textarea id="eventDescription" value={newEventData.description || ""} onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })} placeholder="Detail tambahan mengenai acara..." />
            </div>
            <DialogFooter className="mt-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit">{editingEvent ? "Simpan Perubahan" : "Tambah Acara"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

