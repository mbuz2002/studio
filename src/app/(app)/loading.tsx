
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center text-center">
        <Sparkles className="h-16 w-16 animate-pulse text-primary mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Menyiapkan Keajaiban...</h2>
        <p className="text-base text-muted-foreground">
          Mohon tunggu sebentar, EduAI Planner sedang memuat halaman untuk Anda.
        </p>
      </div>
    </div>
  );
}
