
import { Sparkles } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <LoadingSpinner 
      message="Mohon tunggu sebentar, GUMPLA AI sedang memuat halaman untuk Anda." 
      icon={<Sparkles className="h-16 w-16 animate-pulse text-primary mb-6" />}
    />
  );
}

