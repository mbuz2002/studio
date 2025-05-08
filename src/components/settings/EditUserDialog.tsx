
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { useAuth } from "@/contexts/AuthContext"; // For current admin user

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User; // The user being edited
  onUserUpdated: (updatedUserData: Partial<User>) => void;
}

export function EditUserDialog({ isOpen, onOpenChange, user: userToEdit, onUserUpdated }: EditUserDialogProps) {
  const [name, setName] = useState(userToEdit.name);
  const [email, setEmail] = useState(userToEdit.email);
  const [avatarUrl, setAvatarUrl] = useState(userToEdit.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user: adminUser } = useAuth(); // The admin performing the action (if applicable)


  useEffect(() => {
    if (isOpen) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setAvatarUrl(userToEdit.avatarUrl || "");
      // Reset password fields when dialog opens
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen, userToEdit]);

  const getInitials = (nameStr: string) => {
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const logSource = "EditUserDialog";

    if (!name || !email) {
      toast({ title: "Data Profil Tidak Lengkap", description: "Nama dan email tidak boleh kosong.", variant: "destructive" });
      addLog("WARN", `Gagal memperbarui profil pengguna ${userToEdit.email}: Nama atau email kosong. Diedit oleh: ${adminUser?.email || 'sistem'}.`, logSource);
      setIsLoading(false);
      return;
    }
    
    // Profile update part
    const updatedUserData: Partial<User> = {};
    let profileChanged = false;
    if (name !== userToEdit.name) { updatedUserData.name = name; profileChanged = true; }
    if (email !== userToEdit.email) { updatedUserData.email = email; profileChanged = true; }
    const newAvatar = avatarUrl || `https://picsum.photos/seed/${email}/100/100`;
    if (newAvatar !== userToEdit.avatarUrl) { updatedUserData.avatarUrl = newAvatar; profileChanged = true; }

    if (profileChanged) {
      onUserUpdated(updatedUserData); // This will show "Profil Diperbarui" toast via SettingsPage / AuthContext
      addLog("INFO", `Profil pengguna ${userToEdit.email} diperbarui oleh ${adminUser?.email || 'sistem'}. Perubahan: ${JSON.stringify(updatedUserData)}`, logSource);
    }

    // Password change part (simulated)
    if (newPassword || confirmNewPassword || currentPassword) { // Only process if any password field is touched
      if (newPassword !== confirmNewPassword) {
        toast({ title: "Gagal Mengganti Kata Sandi", description: "Kata sandi baru dan konfirmasi kata sandi tidak cocok.", variant: "destructive" });
        addLog("WARN", `Gagal mengganti kata sandi untuk ${userToEdit.email}: Kata sandi baru tidak cocok. Diedit oleh: ${adminUser?.email || 'sistem'}.`, logSource);
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6 && newPassword.length > 0) { // Simple length check for demo
        toast({ title: "Gagal Mengganti Kata Sandi", description: "Kata sandi baru minimal 6 karakter.", variant: "destructive" });
        addLog("WARN", `Gagal mengganti kata sandi untuk ${userToEdit.email}: Kata sandi baru kurang dari 6 karakter. Diedit oleh: ${adminUser?.email || 'sistem'}.`, logSource);
        setIsLoading(false);
        return;
      }
      if (newPassword.length >= 6) {
          // Simulate password change success
          toast({
            title: "Kata Sandi Diperbarui",
            description: `Kata sandi untuk ${userToEdit.email} telah berhasil diperbarui (simulasi).`,
          });
          addLog("INFO", `Kata sandi untuk pengguna ${userToEdit.email} diperbarui oleh ${adminUser?.email || 'sistem'} (simulasi).`, logSource);
          // Clear password fields after successful "change"
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
      } else if (!newPassword && (currentPassword || confirmNewPassword)) {
         toast({ title: "Informasi Kata Sandi Tidak Lengkap", description: "Harap isi kata sandi baru jika ingin mengubahnya.", variant: "destructive" });
         addLog("WARN", `Percobaan mengubah kata sandi untuk ${userToEdit.email} gagal: Kata sandi baru kosong. Diedit oleh: ${adminUser?.email || 'sistem'}.`, logSource);
      }
    }
    
    setIsLoading(false);
    if (profileChanged || (newPassword.length >=6 && newPassword === confirmNewPassword)) {
        onOpenChange(false); // Close dialog if changes were made and successful
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <UserCircle2 className="h-6 w-6 text-primary" />
            Edit Profil Pengguna: {userToEdit.name}
          </DialogTitle>
          <DialogDescription>Perbarui informasi profil pengguna. Perubahan akan diterapkan setelah disimpan.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
              <Input id="role-edit" value={userToEdit.role} disabled className="bg-muted/50 cursor-not-allowed" />
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
          </form>
        </ScrollArea>
        <DialogFooter className="mt-auto px-6 pb-6 pt-4 border-t sm:justify-end">
          <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading} onClick={handleSubmit} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
