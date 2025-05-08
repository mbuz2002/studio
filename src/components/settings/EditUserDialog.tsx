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
import { Save, UserCircle2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || "");
      // Reset password fields when dialog opens
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen, user]);

  const getInitials = (nameStr: string) => {
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email) {
      toast({ title: "Data Profil Tidak Lengkap", description: "Nama dan email tidak boleh kosong.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    // Profile update part
    const updatedUserData: Partial<User> = {
      name,
      email,
      avatarUrl: avatarUrl || `https://picsum.photos/seed/${email}/100/100`,
    };
    onUserUpdated(updatedUserData); // This will show "Profil Diperbarui" toast via SettingsPage

    // Password change part (simulated)
    if (newPassword || confirmNewPassword || currentPassword) { // Only process if any password field is touched
      if (newPassword !== confirmNewPassword) {
        toast({ title: "Gagal Mengganti Kata Sandi", description: "Kata sandi baru dan konfirmasi kata sandi tidak cocok.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6 && newPassword.length > 0) { // Simple length check for demo
        toast({ title: "Gagal Mengganti Kata Sandi", description: "Kata sandi baru minimal 6 karakter.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (newPassword.length >= 6) {
          // Simulate password change success
          // In a real app, you'd call an API here to change the password
          // For this demo, we just show a success message
          toast({
          title: "Kata Sandi Diperbarui",
          description: "Kata sandi Anda telah berhasil diperbarui (simulasi).",
          });
          // Clear password fields after successful "change"
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
      } else if (!newPassword && (currentPassword || confirmNewPassword)) {
        // If new password is empty but other password fields were touched
         toast({ title: "Informasi Kata Sandi Tidak Lengkap", description: "Harap isi kata sandi baru jika ingin mengubahnya.", variant: "destructive" });
      }
    }
    
    setIsLoading(false);
    // Dialog will be closed by parent if onUserUpdated is successful.
    // If only password fields were touched and no profile update, we might need to close explicitly.
    // However, onUserUpdated always runs, so parent handles closure.
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
              <Input id="role-edit" value={user.role} disabled className="bg-muted/50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Peran tidak dapat diubah melalui halaman ini.</p>
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-1">
                <Label htmlFor="currentPassword">Kata Sandi Saat Ini (Kosongkan jika tidak ingin mengubah)</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="********" />
                <p className="text-xs text-muted-foreground">Untuk demo, validasi kata sandi saat ini diabaikan.</p>
            </div>
             <div className="space-y-1">
                <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            </div>
             <div className="space-y-1">
                <Label htmlFor="confirmNewPassword">Konfirmasi Kata Sandi Baru</Label>
                <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Ulangi kata sandi baru" />
            </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t">
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
