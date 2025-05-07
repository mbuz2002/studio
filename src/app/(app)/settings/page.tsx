import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
              <Cog className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Pengaturan</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Kelola preferensi aplikasi dan pengaturan akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>Perbarui rincian pribadi Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Formulir pengaturan profil akan ada di sini.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Preferensi Aplikasi</CardTitle>
                <CardDescription>Sesuaikan pengalaman EduAI Planner Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tema, notifikasi, dan preferensi lainnya akan dikelola di sini.</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Ekspor/Impor Data</CardTitle>
                <CardDescription>Kelola data kurikulum Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Opsi untuk mengekspor semua data atau mengimpor dari format yang didukung akan ada di sini.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
