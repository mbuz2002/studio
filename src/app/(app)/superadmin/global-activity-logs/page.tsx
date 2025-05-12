
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, RotateCw, Search, ShieldAlert, Info, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLog, type LogEntry, type LogLevel, MAX_LOGS } from "@/contexts/LogContext"; 
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function GlobalActivityLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const { logs: contextLogs, addLog: addLogToContext } = useLog();
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
      if (user?.role !== "SuperAdmin") {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          variant: "destructive",
        });
        if(user) { 
            addLogToContext("WARN", `Pengguna ${user.email} (Peran: ${user.role}) mencoba mengakses Log Aktivitas Global tanpa izin SuperAdmin.`, "GlobalActivityLogsPage");
        }
        router.push("/dashboard"); // Or superadmin dashboard if appropriate
      } else {
        addLogToContext("INFO", `SuperAdmin ${user.email} mengakses halaman Log Aktivitas Global.`, "GlobalActivityLogsPage");
      }
      setPageLoading(false); 
    }
  }, [user, authLoading, isClient, router, toast, addLogToContext]);

  const filteredLogs = useMemo(() => 
    contextLogs
    .filter(log => levelFilter === "ALL" || log.level === levelFilter)
    .filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.level && log.level.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [contextLogs, levelFilter, searchTerm]
  );

  const handleRefreshLogs = () => {
    toast({ title: "Log Diperbarui", description: "Tampilan log telah diperbarui dari sumber data terkini." });
    addLogToContext("INFO", "Log aktivitas global diminta untuk diperbarui secara manual oleh SuperAdmin.", "GlobalActivityLogsPage");
  };

  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "INFO":
        return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case "ERROR":
        return <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      case "CRITICAL":
        return <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 dark:text-red-500" />;
      default:
        return <Activity className="h-4 w-4 sm:h-5 sm:w-5" />; 
    }
  };
  
  const getLogLevelBadgeVariant = (level: LogLevel): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case "INFO":
        return "default";
      case "WARN":
        return "secondary";
      case "ERROR":
      case "CRITICAL":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (pageLoading || authLoading || !isClient) {
    return (
      <LoadingSpinner 
        icon={<Activity className="h-12 w-12 animate-pulse text-primary mb-4" />}
        message="Memverifikasi akses dan memuat log global..."
      />
    );
  }
  
  if (user?.role !== "SuperAdmin") {
     return (
      <div className="flex h-screen items-center justify-center">
        <p className="ml-3 text-lg text-destructive">Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 md:py-8">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="p-6 rounded-t-lg bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">Log Aktivitas Global</CardTitle>
              <CardDescription className="text-primary-foreground/90 mt-1">
                Tinjau semua aktivitas, kesalahan, dan peristiwa penting dalam sistem secara real-time dari seluruh sekolah.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md rounded-md">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Entri Log Global ({filteredLogs.length} / {contextLogs.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari log (pesan, sumber, level)..."
                  className="pl-10 w-full sm:w-[200px] lg:w-[280px] text-sm sm:text-base h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | "ALL")}>
                <SelectTrigger className="w-full sm:w-auto min-w-[140px] sm:min-w-[150px] text-sm sm:text-base h-10">
                  <SelectValue placeholder="Filter Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Level</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">PERINGATAN</SelectItem>
                  <SelectItem value="ERROR">KESALAHAN</SelectItem>
                  <SelectItem value="CRITICAL">KRITIS</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefreshLogs} variant="outline" className="w-full sm:w-auto text-sm sm:text-base h-10">
                <RotateCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Segarkan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="rounded-md border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[170px] min-w-[160px] sm:w-[200px] sm:min-w-[190px] text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Waktu</TableHead>
                  <TableHead className="w-[120px] min-w-[110px] sm:w-[140px] sm:min-w-[130px] text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Level</TableHead>
                  <TableHead className="min-w-[300px] sm:min-w-[350px] text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Pesan</TableHead>
                  <TableHead className="w-[150px] min-w-[140px] sm:w-[200px] sm:min-w-[170px] text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3">Sumber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-base sm:text-lg text-muted-foreground px-3 sm:px-4 py-2 sm:py-3">
                      {contextLogs.length === 0 ? "Tidak ada log tersedia." : "Tidak ada log yang cocok dengan filter Anda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className={
                        log.level === "ERROR" || log.level === "CRITICAL" ? "bg-destructive/10 hover:bg-destructive/15" : 
                        log.level === "WARN" ? "bg-yellow-500/10 hover:bg-yellow-500/15" : "hover:bg-muted/50"
                    }>
                      <TableCell className="text-xs sm:text-sm font-roboto px-3 sm:px-4 py-2 sm:py-3 align-top">
                        {isClient ? format(log.timestamp, "dd MMM yy, HH:mm:ss.SSS", { locale: indonesianLocale }) : log.timestamp.toISOString()}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-2 sm:py-3 align-top">
                        <Badge variant={getLogLevelBadgeVariant(log.level)} className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-2.5">
                          {getLogLevelIcon(log.level)}
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm break-words whitespace-pre-wrap px-3 sm:px-4 py-2 sm:py-3 align-top">{log.message}</TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground px-3 sm:px-4 py-2 sm:py-3 align-top">{log.source || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        <Alert variant="default" className="mt-6 sm:mt-8 border-primary/50 shadow-md rounded-md p-4 sm:p-6">
            <Info className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <AlertTitle className="text-base sm:text-lg font-semibold">Tentang Log Global</AlertTitle>
            <AlertDescription className="text-sm sm:text-base">
            Log global ini (dalam versi demo) menampilkan semua log yang dihasilkan dalam sesi browser ini, sama seperti log sistem yang dilihat Admin sekolah. 
            Dalam aplikasi produksi, log ini akan berasal dari server terpusat yang mengumpulkan log dari semua sekolah dan pengguna.
            Log dibatasi hingga {MAX_LOGS} entri terakhir di tampilan ini.
            </AlertDescription>
      </Alert>
    </div>
  );
}
