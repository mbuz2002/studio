
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, RotateCw, Search, ShieldAlert, Trash2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string; 
}

const mockLogEntries: LogEntry[] = [
  { id: "log1", timestamp: new Date(Date.now() - 5 * 60 * 1000), level: "INFO", message: "Pengguna admin@sekolah.id berhasil masuk.", source: "AuthContext" },
  { id: "log2", timestamp: new Date(Date.now() - 4 * 60 * 1000), level: "INFO", message: "PROTA Matematika Fase D berhasil dibuat.", source: "AnnualProgramsPage" },
  { id: "log3", timestamp: new Date(Date.now() - 3 * 60 * 1000), level: "WARN", message: "AI suggestion for 'Revolusi Industri' took longer than expected (3.5s).", source: "AIAssistantPage" },
  { id: "log4", timestamp: new Date(Date.now() - 2 * 60 * 1000), level: "ERROR", message: "Gagal menyimpan profil sekolah: Koneksi ke database gagal (simulasi).", source: "SchoolProfileForm" },
  { id: "log5", timestamp: new Date(Date.now() - 1 * 60 * 1000), level: "INFO", message: "Mode perawatan diaktifkan oleh admin@sekolah.id.", source: "AdminSystemSettings" },
];

export default function SystemLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching logs on mount
    setTimeout(() => {
        setLogs(mockLogEntries);
        setPageLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!authLoading && isClient) {
      if (!user || user.role !== "Admin") {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, isClient, router, toast]);

  const filteredLogs = logs
    .filter(log => levelFilter === "ALL" || log.level === levelFilter)
    .filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()) || (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleRefreshLogs = () => {
    setPageLoading(true);
    // Simulate fetching new logs
    setTimeout(() => {
        const newLogEntry: LogEntry = {
        id: `log${Date.now()}`,
        timestamp: new Date(),
        level: "INFO",
        message: "Log berhasil diperbarui secara manual.",
        source: "SystemLogsPage"
        };
        setLogs(prevLogs => [newLogEntry, ...mockLogEntries.slice(0,4)].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50)); // Keep max 50 logs for demo
        setPageLoading(false);
        toast({ title: "Log Diperbarui", description: "Log sistem telah dimuat ulang." });
    }, 300);
  };

  const handleClearLogs = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua log? Tindakan ini tidak dapat diurungkan (simulasi).")) {
      setLogs([]);
      toast({ title: "Log Dibersihkan", description: "Semua log sistem telah dihapus (simulasi).", variant: "destructive" });
    }
  };

  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "INFO":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "ERROR":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getLogLevelBadgeVariant = (level: LogLevel): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case "INFO":
        return "default";
      case "WARN":
        return "secondary";
      case "ERROR":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (!isClient || authLoading || !user || user.role !== "Admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memverifikasi akses dan memuat log...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 md:py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">Log Sistem Aplikasi</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Tinjau aktivitas, kesalahan, dan peristiwa penting dalam sistem.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl">Entri Log</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari log..."
                  className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | "ALL")}>
                <SelectTrigger className="w-full sm:w-auto min-w-[130px]">
                  <SelectValue placeholder="Filter Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Level</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">PERINGATAN</SelectItem>
                  <SelectItem value="ERROR">KESALAHAN</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshLogs} variant="outline" className="w-full sm:w-auto">
                {pageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                {pageLoading ? "Memuat..." : "Segarkan"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pageLoading && !logs.length ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Memuat entri log...</p>
            </div>
          ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] min-w-[170px]">Waktu</TableHead>
                  <TableHead className="w-[120px] min-w-[110px]">Level</TableHead>
                  <TableHead className="min-w-[300px]">Pesan</TableHead>
                  <TableHead className="w-[180px] min-w-[150px]">Sumber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {logs.length === 0 && !pageLoading ? "Tidak ada log tersedia." : "Tidak ada log yang cocok dengan filter Anda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className={
                        log.level === "ERROR" ? "bg-destructive/10 hover:bg-destructive/20" : 
                        log.level === "WARN" ? "bg-yellow-500/10 hover:bg-yellow-500/20" : ""
                    }>
                      <TableCell className="text-xs">
                        {isClient ? format(log.timestamp, "dd MMM yyyy, HH:mm:ss", { locale: indonesianLocale }) : log.timestamp.toISOString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLogLevelBadgeVariant(log.level)} className="flex items-center gap-1.5 whitespace-nowrap">
                          {getLogLevelIcon(log.level)}
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm break-words">{log.message}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.source || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          )}
          {logs.length > 0 && !pageLoading && (
             <div className="mt-6 flex justify-end">
                <Button onClick={handleClearLogs} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Bersihkan Semua Log
                </Button>
             </div>
          )}
        </CardContent>
      </Card>
        <Alert variant="default" className="mt-8">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle>Tentang Log Sistem</AlertTitle>
            <AlertDescription>
            Log sistem ini adalah simulasi untuk tujuan demonstrasi. Dalam aplikasi produksi, log akan disimpan secara persisten dan mungkin terintegrasi dengan layanan logging eksternal untuk analisis dan pemantauan yang lebih mendalam.
            </AlertDescription>
      </Alert>
    </div>
  );
}
