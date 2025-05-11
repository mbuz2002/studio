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
import type { School } from "@/types";
import { Save, CreditCard } from "lucide-react";

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

export function SubscriptionEditDialog({ isOpen, onOpenChange, school, onSave }: SubscriptionEditDialogProps) {
  const [status, setStatus] = useState<School['subscriptionStatus']>(school.subscriptionStatus);
  const [paymentDetails, setPaymentDetails] = useState(school.paymentDetails || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(school.subscriptionStatus);
      setPaymentDetails(school.paymentDetails || "");
    }
  }, [isOpen, school]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const updatedSchool: School = {
      ...school,
      subscriptionStatus: status,
      paymentDetails: paymentDetails,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedSchool);
    setIsLoading(false);
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Kelola Langganan: {school.name}
          </DialogTitle>
          <DialogDescription>
            Perbarui status langganan dan catatan pembayaran untuk sekolah ini.
          </DialogDescription>
        </DialogHeader>
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
          </div>
        </form>
        <DialogFooter className="mt-2">
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
