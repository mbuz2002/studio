
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
import type { User } from "@/types";
import { Save, UserCircle2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/contexts/AuthContext";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User; // The user being edited
  onUserUpdated: (updatedUserData: Partial<User>) => void;
}

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
      setAvatarPreview(userToEdit.avatarUrl || null);
      setAvatarFile(null); // Reset file on open
      if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input visually
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [isOpen, userToEdit]);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for demo
        toast({
          title: "Ukuran File Terlalu Besar",
          description: "Ukuran file avatar maksimal 2MB.",
          variant: "destructive",
        });
        addLog("WARN", `Gagal unggah avatar untuk ${userToEdit.email}: File terlalu besar (${(file.size / (1024*1024)).toFixed(2)}MB). Oleh: ${adminUser?.email || 'sistem'}.`, "EditUserDialog-Avatar");
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          title: "Format File Tidak Didukung",
          description: "Harap unggah file gambar (PNG, JPG, GIF, WebP).",
          variant: "destructive",
        });
        addLog("WARN", `Gagal unggah avatar untuk ${userToEdit.email}: Format file tidak didukung (${file.type}). Oleh: ${adminUser?.email || 'sistem'}.`, "EditUserDialog-Avatar");
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
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
    
    // Avatar update logic
    if (avatarFile && avatarPreview) { // A new file was selected and previewed
      updatedUserData.avatarUrl = avatarPreview; // This will be a data URI
      profileChanged = true;
    } else if (!avatarFile && userToEdit.avatarUrl !== avatarPreview && avatarPreview === null) { 
      // This means the user might have cleared a URL that was there without uploading a new file, or it was initially null.
      // If they want to remove avatar, avatarPreview would be null.
      // For demo, if avatarPreview is null (cleared or never set) and no new file, we might want to fall back or explicitly set to undefined/null.
      // Let's assume for now if avatarPreview is null and no new file, they intend to remove or use default.
      // If using ui-avatars, we could generate one if no specific image is provided.
      // For simplicity, if avatarPreview is explicitly set to null (e.g., by a "remove avatar" button not implemented here),
      // or if a file was uploaded and then cleared, it would reflect that.
      // If it's unchanged from initial load, no change.
      if(userToEdit.avatarUrl !== null && avatarPreview === null) { // If it was there and now it's not
        updatedUserData.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random&color=fff`; // Default to ui-avatars
        profileChanged = true;
      }
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
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random&color=fff`} alt={name} data-ai-hint="user avatar" />
                    <AvatarFallback className="text-3xl">
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

    