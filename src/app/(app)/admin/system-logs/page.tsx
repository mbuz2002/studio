
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
import { useLog, type LogEntry, type LogLevel } from "@/contexts/LogContext";
import { MAX_LOGS } from "@/contexts/LogContext"; // Import MAX_LOGS

export default function SystemLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const { logs: contextLogs, clearLogs, addLog: addLogToContext } = useLog();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [pageLoading, setPageLoading] = useState(true); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isClient) {
      if (!user || user.role !== "Admin") {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          variant: "destructive",
        });
        if(user) { 
            addLogToContext("WARN", `Pengguna ${user.email} (Peran: ${user.role}) mencoba mengakses Log Sistem tanpa izin.`, "SystemLogsPage");
        }
        router.push("/dashboard");
      } else {
        addLogToContext("INFO", `Admin ${user.email} mengakses halaman Log Sistem.`, "SystemLogsPage");
      }
      setPageLoading(false); 
    }
  }, [user, authLoading, isClient, router, toast, addLogToContext]);

  const filteredLogs = contextLogs
    .filter(log => levelFilter === "ALL" || log.level === levelFilter)
    .filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()) || (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleRefreshLogs = () => {
    toast({ title: "Log Diperbarui", description: "Tampilan log telah diperbarui dari sumber data terkini." });
    addLogToContext("INFO", "Log sistem diminta untuk diperbarui secara manual.", "SystemLogsPage");
  };

  const handleClearLogs = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua log dari tampilan saat ini? Ini tidak akan menghapus log dari penyimpanan permanen (jika ada).")) {
      const logCount = contextLogs.length;
      clearLogs(); 
      toast({ title: "Log Dibersihkan", description: "Semua log sistem telah dihapus dari tampilan ini.", variant: "default" });
      addLogToContext("WARN", `Semua log (${logCount} entri) dibersihkan oleh Admin ${user?.email}.`, "SystemLogsPage");
    }
  };

  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "INFO":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "WARN":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "ERROR":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5" />; // Fallback icon
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

  if (pageLoading || authLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg">Memverifikasi akses dan memuat log...</p>
      </div>
    );
  }
  
  if (!user || user.role !== "Admin") {
     return (
      <div className="flex h-screen items-center justify-center">
        <p className="ml-3 text-lg">Akses ditolak.</p>
      </div>
    );
  }


  return (
    <div className="space-y-8 py-4 md:py-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <div className="flex items-center gap-4">
            <Activity className="h-10 w-10 text-primary-foreground drop-shadow-lg flex-shrink-0" />
            <div>
                <CardTitle className="text-3xl md:text-4xl font-bold">Log Sistem Aplikasi</CardTitle>
                <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-1">
                    Tinjau aktivitas, kesalahan, dan peristiwa penting dalam sistem secara real-time.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md rounded-md">
        <CardHeader className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-semibold">Entri Log ({filteredLogs.length} / {contextLogs.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari log..."
                  className="pl-10 w-full sm:w-[220px] lg:w-[280px] text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | "ALL")}>
                <SelectTrigger className="w-full sm:w-auto min-w-[150px] text-base">
                  <SelectValue placeholder="Filter Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Level</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">PERINGATAN</SelectItem>
                  <SelectItem value="ERROR">KESALAHAN</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshLogs} variant="outline" className="w-full sm:w-auto text-base">
                <RotateCw className="mr-2 h-5 w-5" />
                Segarkan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="rounded-md border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] min-w-[190px] text-sm">Waktu</TableHead>
                  <TableHead className="w-[140px] min-w-[130px] text-sm">Level</TableHead>
                  <TableHead className="min-w-[350px] text-sm">Pesan</TableHead>
                  <TableHead className="w-[200px] min-w-[170px] text-sm">Sumber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-lg text-muted-foreground">
                      {contextLogs.length === 0 ? "Tidak ada log tersedia." : "Tidak ada log yang cocok dengan filter Anda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className={
                        log.level === "ERROR" ? "bg-destructive/10 hover:bg-destructive/15" : 
                        log.level === "WARN" ? "bg-yellow-500/10 hover:bg-yellow-500/15" : "hover:bg-muted/50"
                    }>
                      <TableCell className="text-sm font-roboto">
                        {isClient ? format(log.timestamp, "dd MMM yyyy, HH:mm:ss.SSS", { locale: indonesianLocale }) : log.timestamp.toISOString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLogLevelBadgeVariant(log.level)} className="flex items-center gap-2 whitespace-nowrap text-sm py-1 px-2.5">
                          {getLogLevelIcon(log.level)}
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm break-words whitespace-pre-wrap">{log.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.source || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {contextLogs.length > 0 && (
             <div className="mt-6 flex justify-end">
                <Button onClick={handleClearLogs} variant="destructive" className="text-base">
                    <Trash2 className="mr-2 h-5 w-5" /> Bersihkan Log Tampilan
                </Button>
             </div>
          )}
        </CardContent>
      </Card>
        <Alert variant="default" className="mt-8 border-primary/50 shadow-md rounded-md">
            <Info className="h-6 w-6 text-primary" />
            <AlertTitle className="text-lg font-semibold">Tentang Log Sistem</AlertTitle>
            <AlertDescription className="text-base">
            Log sistem ini dikelola secara real-time di sisi klien selama sesi berlangsung dan dibatasi hingga {MAX_LOGS} entri terakhir. Membersihkan log hanya akan menghapus log dari tampilan sesi ini. Dalam aplikasi produksi, log penting akan disimpan secara persisten di server.
            </AlertDescription>
      </Alert>
    </div>
  );
}
