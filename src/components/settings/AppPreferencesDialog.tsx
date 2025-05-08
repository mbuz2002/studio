
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
import { useTheme, type Theme } from "@/contexts/ThemeContext"; // Import Theme type

interface AppPreferencesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppPreferencesDialog({ isOpen, onOpenChange }: AppPreferencesDialogProps) {
  const { theme: currentTheme, setTheme, availableThemes } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme);
    }
  }, [isOpen, currentTheme]);

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value as Theme);
  };

  const handleSubmit = () => {
    setTheme(selectedTheme); // setTheme from context handles localStorage and applying to document
    const selectedThemeLabel = availableThemes.find(t => t.value === selectedTheme)?.label || selectedTheme;
    toast({
      title: "Preferensi Disimpan",
      description: `Tema tampilan telah diatur ke ${selectedThemeLabel}.`,
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
                {availableThemes.map(themeOption => (
                  <SelectItem key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Pilih tema visual untuk aplikasi. 'Sistem' akan mengikuti preferensi perangkat Anda.
            </p>
          </div>
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
