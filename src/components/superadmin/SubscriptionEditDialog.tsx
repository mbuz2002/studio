
"use client";

import { useState, useEffect, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { School, SchoolFeatureSettings } from "@/types";
import { DEFAULT_FEATURE_SETTINGS } from "@/types";
import { Save, CreditCard, Settings2, Sparkles, CalendarCheck, ListChecks, BookOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubscriptionEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  school: School;
  onSave: (updatedSchool: School) => void;
}

const subscriptionStatusOptions: { value: School['subscriptionStatus']; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Tidak Aktif (Ditangguhkan)" },
  { value: "trial", label: "Uji Coba (Trial)" },
];

interface FeatureToggleOption {
  key: keyof SchoolFeatureSettings;
  label: string;
  description: string;
  icon: React.ElementType;
}

const featureToggleOptions: FeatureToggleOption[] = [
  { key: "aiToolsEnabled", label: "Alat AI", description: "Akses ke Asisten AI Materi dan pembuatan Modul Ajar AI.", icon: Sparkles },
  { key: "academicCalendarEnabled", label: "Kalender Akademik", description: "Akses ke fitur Kalender Pendidikan.", icon: CalendarCheck },
  { key: "timetableManagementEnabled", label: "Manajemen Jadwal", description: "Akses ke fitur Jadwal Pelajaran.", icon: ListChecks },
  { key: "masterDataManagementEnabled", label: "Master Data", description: "Akses ke pengelolaan Mata Pelajaran, Guru, dan Kelas.", icon: BookOpen },
];


export function SubscriptionEditDialog({ isOpen, onOpenChange, school, onSave }: SubscriptionEditDialogProps) {
  const [status, setStatus] = useState<School['subscriptionStatus']>(school.subscriptionStatus);
  const [paymentDetails, setPaymentDetails] = useState(school.paymentDetails || "");
  const [featureSettings, setFeatureSettings] = useState<SchoolFeatureSettings>(school.featureSettings || DEFAULT_FEATURE_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(school.subscriptionStatus);
      setPaymentDetails(school.paymentDetails || "");
      setFeatureSettings(school.featureSettings || DEFAULT_FEATURE_SETTINGS);
    }
  }, [isOpen, school]);

  const handleFeatureToggle = (featureKey: keyof SchoolFeatureSettings) => {
    setFeatureSettings(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const updatedSchool: School = {
      ...school,
      subscriptionStatus: status,
      paymentDetails: paymentDetails,
      featureSettings: featureSettings, // Save feature settings
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedSchool);
    setIsLoading(false);
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Kelola Langganan & Fitur: {school.name}
          </DialogTitle>
          <DialogDescription>
            Perbarui status langganan, catatan pembayaran, dan fitur yang aktif untuk sekolah ini.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6">
        <form onSubmit={handleSubmit} id="edit-subscription-form">
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="subscriptionStatus">Status Langganan</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as School['subscriptionStatus'])}>
                <SelectTrigger id="subscriptionStatus">
                  <SelectValue placeholder="Pilih Status Langganan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionStatusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paymentDetails">Catatan Pembayaran (Manual)</Label>
              <Textarea 
                id="paymentDetails" 
                value={paymentDetails} 
                onChange={(e) => setPaymentDetails(e.target.value)} 
                placeholder="cth., Transfer Bank ABC, Tgl XX/YY/ZZZZ, Sejumlah Rp. X.XXX.XXX"
                rows={3}
              />
            </div>
            
            <hr className="my-4"/>
            <div className="space-y-1">
                <Label className="text-md font-semibold flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary"/>Kontrol Fitur Aplikasi</Label>
                <p className="text-sm text-muted-foreground">Pilih fitur yang akan diaktifkan untuk sekolah ini.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {featureToggleOptions.map(feature => (
                     <div key={feature.key} className="flex items-start space-x-2 p-3 border rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                        <Checkbox
                            id={`feature-${feature.key}`}
                            checked={featureSettings[feature.key]}
                            onCheckedChange={() => handleFeatureToggle(feature.key)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`feature-${feature.key}`} className="font-medium flex items-center gap-1.5 cursor-pointer">
                                <feature.icon className="h-4 w-4 text-primary/80"/> {feature.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </form>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 px-6 pb-6 border-t sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>Batal</Button>
          </DialogClose>
          <Button type="submit" form="edit-subscription-form" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
