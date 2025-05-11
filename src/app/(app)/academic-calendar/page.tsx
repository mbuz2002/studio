
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarCheck, PlusCircle, Edit2, Trash2, AlertCircle } from "lucide-react";
import type { DateRange, DayPickerProps, DayProps, SelectSingleEventHandler } from "react-day-picker";
import { format, parseISO, isValid, startOfMonth, endOfMonth } from 'date-fns';
import { id as indonesianLocale } from 'date-fns/locale';
import type { AcademicEvent, AcademicEventType, UserRole } from "@/types";
import { ACADEMIC_EVENTS_STORAGE_KEY } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const eventTypes: { value: AcademicEventType; label: string; color: string }[] = [
  { value: "Libur Nasional", label: "Libur Nasional", color: "bg-red-500" },
  { value: "Libur Semester", label: "Libur Semester", color: "bg-red-400" },
  { value: "Ujian Sekolah", label: "Ujian Sekolah", color: "bg-yellow-500" },
  { value: "Kegiatan Sekolah", label: "Kegiatan Sekolah", color: "bg-blue-500" },
  { value: "Tanggal Penting", label: "Tanggal Penting", color: "bg-green-500" },
  { value: "Lainnya", label: "Lainnya", color: "bg-gray-500" },
];

const getEventTypeColor = (type: AcademicEventType): string => {
  return eventTypes.find(et => et.value === type)?.color || "bg-gray-500";
};

const initialAcademicEvents: AcademicEvent[] = [
  // Example data if needed, otherwise it will be an empty array or loaded from localStorage
];

export default function AcademicCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { addLog } = useLog();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
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
        isNationalHoliday: newEventData.isNationalHoliday,
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
  const eventDates = useMemo(() => eventDateStrings.map(dateStr => parseISO(dateStr)).filter(date => isValid(date)), [eventDateStrings]);

  const modifiers: DayPickerProps['modifiers'] = {
    eventDay: eventDates,
  };

  const modifiersStyles: DayPickerProps['modifiersStyles'] = {
    eventDay: {
      border: `2px solid hsl(var(--primary))`,
      borderRadius: '50%',
    },
  };

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
    return events.filter(event => event.date === formattedSelectedDate || (event.endDate && formattedSelectedDate >= event.date && formattedSelectedDate <= event.endDate));
  }, [selectedDate, events]);
  
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
            {canManageEvents && (
              <Button onClick={handleAddEventClick} className="bg-background/20 hover:bg-background/30 text-primary-foreground w-full sm:w-auto shadow-md">
                <PlusCircle className="mr-2 h-5 w-5" /> Tambah Acara Baru
              </Button>
            )}
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
                  day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal rounded-full hover:bg-accent/50",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
                  day_today: "bg-accent text-accent-foreground rounded-full",
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
                                <span className={`inline-block h-3 w-3 rounded-full ${getEventTypeColor(event.type)}`}></span>
                                <h4 className="font-semibold text-sm text-primary">{event.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {event.date !== event.endDate && event.endDate ? `${format(parseISO(event.date), 'dd MMM', {locale: indonesianLocale})} - ${format(parseISO(event.endDate), 'dd MMM yyyy', {locale: indonesianLocale})}` : format(parseISO(event.date), 'dd MMM yyyy', {locale: indonesianLocale})}
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
                        {event.description && <p className="text-xs mt-1.5 text-foreground/80">{event.description}</p>}
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
                    <Input id="eventDate" type="date" value={newEventData.date ? format(parseISO(newEventData.date), 'yyyy-MM-dd') : ''} onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="eventEndDate">Tanggal Selesai (Opsional)</Label>
                    <Input id="eventEndDate" type="date" value={newEventData.endDate ? format(parseISO(newEventData.endDate), 'yyyy-MM-dd') : ''} onChange={(e) => setNewEventData({ ...newEventData, endDate: e.target.value })} min={newEventData.date}/>
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
