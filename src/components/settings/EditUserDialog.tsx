
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
import type { User } from "@/types";
import { Save, UserCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUserUpdated: (updatedUserData: Partial<User>) => void;
}

export function EditUserDialog({ isOpen, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [isOpen, user]);

  const getInitials = (nameStr: string) => {
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email) {
      toast({ title: "Data Tidak Lengkap", description: "Nama dan email tidak boleh kosong.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call or direct update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUserData: Partial<User> = {
      name,
      email,
      avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`, // Update avatar or generate new if empty
    };

    onUserUpdated(updatedUserData);
    setIsLoading(false);
    // Toast is handled by the parent component (SettingsPage)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle2 className="h-6 w-6 text-primary" />
            Edit Profil Pengguna
          </DialogTitle>
          <DialogDescription>Perbarui informasi profil Anda. Perubahan akan diterapkan setelah disimpan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || `https://picsum.photos/seed/${email}/100/100`} alt={name} data-ai-hint="user avatar" />
                    <AvatarFallback className="text-3xl">
                        {name ? getInitials(name) : <UserCircle2 size={48} />}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1 w-full">
                    <Label htmlFor="avatarUrl-edit">URL Avatar (Opsional)</Label>
                    <Input id="avatarUrl-edit" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://contoh.com/avatar.png" />
                </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="name-edit">Nama Lengkap</Label>
              <Input id="name-edit" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-edit">Alamat Email</Label>
              <Input id="email-edit" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role-edit">Peran</Label>
              <Input id="role-edit" value={user.role} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Peran tidak dapat diubah melalui halaman ini.</p>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
