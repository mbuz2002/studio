
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

export default function SystemLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const { logs: contextLogs, clearLogs, addLog: addLogToContext } = useLog();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [pageLoading, setPageLoading] = useState(true); // For initial auth check

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
        // Add log for access denied attempt
        if(user) { // only log if there's a user trying to access
            addLogToContext("WARN", `Pengguna ${user.email} (Peran: ${user.role}) mencoba mengakses Log Sistem tanpa izin.`, "SystemLogsPage");
        }
        router.push("/dashboard");
      } else {
        // Admin accessed the page
        addLogToContext("INFO", `Admin ${user.email} mengakses halaman Log Sistem.`, "SystemLogsPage");
      }
      setPageLoading(false); // Done with auth check
    }
  }, [user, authLoading, isClient, router, toast, addLogToContext]);

  const filteredLogs = contextLogs
    .filter(log => levelFilter === "ALL" || log.level === levelFilter)
    .filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()) || (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleRefreshLogs = () => {
    // Logs are "live" from context, so refresh is more of a visual cue or for future use
    toast({ title: "Log Diperbarui", description: "Tampilan log telah diperbarui dari sumber data terkini." });
    addLogToContext("INFO", "Log sistem diminta untuk diperbarui secara manual.", "SystemLogsPage");
  };

  const handleClearLogs = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua log dari tampilan saat ini? Ini tidak akan menghapus log dari penyimpanan permanen (jika ada).")) {
      const logCount = contextLogs.length;
      clearLogs(); // Clears logs in LogContext
      toast({ title: "Log Dibersihkan", description: "Semua log sistem telah dihapus dari tampilan ini.", variant: "default" });
      addLogToContext("WARN", `Semua log (${logCount} entri) dibersihkan oleh Admin ${user?.email}.`, "SystemLogsPage");
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

  if (pageLoading || authLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memverifikasi akses dan memuat log...</p>
      </div>
    );
  }
  
  if (!user || user.role !== "Admin") {
     // This case should ideally be handled by the redirect, but as a fallback:
     return (
      <div className="flex h-screen items-center justify-center">
        <p className="ml-2">Akses ditolak.</p>
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
            Tinjau aktivitas, kesalahan, dan peristiwa penting dalam sistem secara real-time.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl">Entri Log ({filteredLogs.length} / {contextLogs.length})</CardTitle>
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
                <RotateCw className="mr-2 h-4 w-4" />
                Segarkan Tampilan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                      {contextLogs.length === 0 ? "Tidak ada log tersedia." : "Tidak ada log yang cocok dengan filter Anda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className={
                        log.level === "ERROR" ? "bg-destructive/10 hover:bg-destructive/20" : 
                        log.level === "WARN" ? "bg-yellow-500/10 hover:bg-yellow-500/20" : ""
                    }>
                      <TableCell className="text-xs">
                        {isClient ? format(log.timestamp, "dd MMM yyyy, HH:mm:ss.SSS", { locale: indonesianLocale }) : log.timestamp.toISOString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLogLevelBadgeVariant(log.level)} className="flex items-center gap-1.5 whitespace-nowrap">
                          {getLogLevelIcon(log.level)}
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm break-words whitespace-pre-wrap">{log.message}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.source || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {contextLogs.length > 0 && (
             <div className="mt-6 flex justify-end">
                <Button onClick={handleClearLogs} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Bersihkan Log Tampilan
                </Button>
             </div>
          )}
        </CardContent>
      </Card>
        <Alert variant="default" className="mt-8">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle>Tentang Log Sistem</AlertTitle>
            <AlertDescription>
            Log sistem ini dikelola secara real-time di sisi klien selama sesi berlangsung dan dibatasi hingga {MAX_LOGS} entri terakhir. Membersihkan log hanya akan menghapus log dari tampilan sesi ini. Dalam aplikasi produksi, log penting akan disimpan secara persisten di server.
            </AlertDescription>
      </Alert>
    </div>
  );
}
