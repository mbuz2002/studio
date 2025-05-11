
"use client";

import { useState, useEffect, type FormEvent, useRef } from "react";
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
import type { User, UserRole } from "@/types";
import { Save, UserCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/contexts/AuthContext";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUserUpdated: (updatedUserData: Partial<User>) => void;
}

const roleDisplayNames: Record<UserRole, string> = {
  SuperAdmin: "Super Administrator",
  Admin: "Administrator",
  KepalaSekolah: "Kepala Sekolah",
  WakaKurikulum: "Waka Kurikulum",
  TataUsaha: "Tata Usaha",
  Guru: "Guru",
};

export function EditUserDialog({ isOpen, onOpenChange, user: userToEdit, onUserUpdated }: EditUserDialogProps) {
  const [name, setName] = useState(userToEdit.name);
  const [email, setEmail] = useState(userToEdit.email);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(userToEdit.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user: adminUser } = useAuth();


  useEffect(() => {
    if (isOpen) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setAvatarPreview(userToEdit.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userToEdit.name || userToEdit.email)}&background=random&color=fff&font-size=0.45`);
      setAvatarFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen, userToEdit]);

  const getInitials = (nameStr: string) => {
    if (!nameStr || typeof nameStr !== 'string') return '';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Ukuran File Terlalu Besar",
          description: "Ukuran file avatar maksimal 2MB.",
          variant: "destructive",
        });
        addLog("WARN", `Gagal unggah avatar untuk ${userToEdit.email}: File terlalu besar (${(file.size / (1024*1024)).toFixed(2)}MB). Oleh: ${adminUser?.email || 'sistem'}.`, "EditUserDialog-Avatar");
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          title: "Format File Tidak Didukung",
          description: "Harap unggah file gambar (PNG, JPG, GIF, WebP).",
          variant: "destructive",
        });
        addLog("WARN", `Gagal unggah avatar untuk ${userToEdit.email}: Format file tidak didukung (${file.type}). Oleh: ${adminUser?.email || 'sistem'}.`, "EditUserDialog-Avatar");
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      addLog("INFO", `Avatar baru (${file.name}) dipilih untuk pengguna ${userToEdit.email}. Oleh: ${adminUser?.email || 'sistem'}.`, "EditUserDialog-Avatar");
    }
  };

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

    const updatedUserData: Partial<User> = {};
    let profileChanged = false;
    if (name !== userToEdit.name) { updatedUserData.name = name; profileChanged = true; }
    if (email !== userToEdit.email) { updatedUserData.email = email; profileChanged = true; }

    if (avatarFile && avatarPreview) {
      updatedUserData.avatarUrl = avatarPreview;
      profileChanged = true;
    } else if (!avatarFile && userToEdit.avatarUrl !== avatarPreview && avatarPreview === null) {
      updatedUserData.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random&color=fff&font-size=0.45`;
      profileChanged = true;
    }


    if (profileChanged) {
      onUserUpdated(updatedUserData);
      addLog("INFO", `Profil pengguna ${userToEdit.email} diperbarui oleh ${adminUser?.email || 'sistem'}. Perubahan: ${JSON.stringify(Object.keys(updatedUserData))}`, logSource);
    }

    if (newPassword || confirmNewPassword || currentPassword) {
      if (newPassword !== confirmNewPassword) {
        toast({ title: "Gagal Mengganti Kata Sandi", description: "Kata sandi baru dan konfirmasi kata sandi tidak cocok.", variant: "destructive" });
        addLog("WARN", `Gagal mengganti kata sandi untuk ${userToEdit.email}: Kata sandi baru tidak cocok. Diedit oleh: ${adminUser?.email || 'sistem'}.`, logSource);
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6 && newPassword.length > 0) {
        toast({ title: "Gagal Mengganti Kata Sandi", description: "Kata sandi baru minimal 6 karakter.", variant: "destructive" });
        addLog("WARN", `Gagal mengganti kata sandi untuk ${userToEdit.email}: Kata sandi baru kurang dari 6 karakter. Diedit oleh: ${adminUser?.email || 'sistem'}.`, logSource);
        setIsLoading(false);
        return;
      }
      if (newPassword.length >= 6) {
          toast({
            title: "Kata Sandi Diperbarui",
            description: `Kata sandi untuk ${userToEdit.email} telah berhasil diperbarui (simulasi).`,
          });
          addLog("INFO", `Kata sandi untuk pengguna ${userToEdit.email} diperbarui oleh ${adminUser?.email || 'sistem'} (simulasi).`, logSource);
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
        onOpenChange(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random&color=fff&font-size=0.45`;

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
          <form onSubmit={handleSubmit} id="edit-user-form" className="grid gap-4 py-4"> {/* Added id to form */}
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage
                        src={avatarPreview || defaultAvatar}
                        alt={name}
                        data-ai-hint="user avatar"
                        key={avatarPreview || defaultAvatar} 
                    />
                    <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">
                        {name ? getInitials(name) : <UserCircle2 size={48} />}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1 w-full">
                    <Label htmlFor="avatarFile-edit">Unggah Avatar Baru (Opsional)</Label>
                    <Input
                        id="avatarFile-edit"
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                     <p className="text-xs text-muted-foreground">Format: PNG, JPG, GIF, WebP. Maks: 2MB.</p>
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
              <Input id="role-edit" value={roleDisplayNames[userToEdit.role] || userToEdit.role} disabled className="bg-muted/50 cursor-not-allowed" />
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
            {/* Moved DialogFooter inside the form */}
            <DialogFooter className="mt-auto pt-4 border-t sm:justify-end">
              <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
              </DialogClose>
              <Button type="submit" form="edit-user-form" disabled={isLoading} className="w-full sm:w-auto"> {/* Button is now type="submit" and uses form attribute */}
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
        {/* Removed DialogFooter from outside ScrollArea/form */}
      </DialogContent>
    </Dialog>
  );
}
