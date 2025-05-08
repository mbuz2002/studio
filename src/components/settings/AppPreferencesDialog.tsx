
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppPreferencesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type Theme = "light" | "dark" | "system";
const THEME_STORAGE_KEY = "app-theme";

export function AppPreferencesDialog({ isOpen, onOpenChange }: AppPreferencesDialogProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
  const { toast } = useToast();

  // Apply theme to the document
  const applyTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  // Load theme from localStorage or system preference on mount
  useEffect(() => {
    if (isOpen) {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) {
        setSelectedTheme(storedTheme);
        // Apply immediately if loaded from storage, RootLayout handles initial non-storage case
        // applyTheme(storedTheme); 
      } else {
        setSelectedTheme("system");
        // applyTheme("system");
      }
    }
  }, [isOpen]);

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as Theme);
  };

  const handleSubmit = () => {
    localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    applyTheme(selectedTheme);
    toast({
      title: "Preferensi Disimpan",
      description: `Tema tampilan telah diatur ke ${selectedTheme === 'light' ? 'Terang' : selectedTheme === 'dark' ? 'Gelap' : 'Sistem'}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Preferensi Aplikasi
          </DialogTitle>
          <DialogDescription>
            Sesuaikan tampilan dan pengalaman Anda dalam menggunakan aplikasi EduAI Planner.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="theme-select">Tema Tampilan</Label>
            <Select value={selectedTheme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme-select">
                <SelectValue placeholder="Pilih tema tampilan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Terang</SelectItem>
                <SelectItem value="dark">Gelap</SelectItem>
                <SelectItem value="system">Sistem (Otomatis)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Pilih tema visual untuk aplikasi. 'Sistem' akan mengikuti preferensi perangkat Anda.
            </p>
          </div>
          {/* Placeholder for future preferences */}
          {/* 
          <div className="space-y-1">
            <Label htmlFor="notifications">Notifikasi</Label>
             <p className="text-sm text-muted-foreground">Pengaturan notifikasi akan datang.</p>
          </div>
          */}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Preferensi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
