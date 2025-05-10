
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex items-center text-xl">
        <Loader2 className="mr-3 h-8 w-8 animate-spin text-primary" />
        Memuat halaman...
      </div>
      <p className="mt-2 text-base text-muted-foreground">Mohon tunggu sebentar.</p>
    </div>
  );
}
