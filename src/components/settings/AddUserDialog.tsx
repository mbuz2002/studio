
"use client";

import * as React from "react"; // Explicitly import React
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, UserRole } from "@/types";
import { PlusCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLog } from "@/contexts/LogContext";
import { useAuth } from "@/contexts/AuthContext";


interface AddUserDialogProps {
  onUserAdded: (newUser: User) => void;
}

const roles: { value: UserRole; label: string }[] = [
  // SuperAdmin should only be assignable by SuperAdmin from a different interface potentially
  // { value: "SuperAdmin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "KepalaSekolah", label: "Kepala Sekolah" },
  { value: "WakaKurikulum", label: "Waka Kurikulum" },
  { value: "TataUsaha", label: "Tata Usaha" },
  { value: "Guru", label: "Guru" },
];

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Guru");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useLog();
  const { user: adminUser } = useAuth(); // Current logged-in admin performing the action
  const logSource = "AddUserDialog";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email || !role || !password) {
      toast({ title: "Data Tidak Lengkap", description: "Harap isi semua kolom.", variant: "destructive" });
      addLog("WARN", `Gagal menambahkan pengguna baru: Data tidak lengkap. Nama: ${name}, Email: ${email}, Peran: ${role}. Oleh: ${adminUser?.email}.`, logSource);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({ title: "Kata Sandi Tidak Valid", description: "Kata sandi minimal 6 karakter.", variant: "destructive" });
      addLog("WARN", `Gagal menambahkan pengguna baru: Kata sandi kurang dari 6 karakter untuk email ${email}. Oleh: ${adminUser?.email}.`, logSource);
      setIsLoading(false);
      return;
    }

    addLog("INFO", `Memulai penambahan pengguna baru. Nama: ${name}, Email: ${email}, Peran: ${role}. Oleh: ${adminUser?.email}.`, logSource);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: `user-${Date.now()}`, // Generate unique ID
      name,
      email,
      role,
      schoolId: adminUser?.schoolId, // Assign to the same school as the admin creating the user
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random&color=fff`,
      updatedAt: new Date().toISOString(),
    };

    onUserAdded(newUser); // Callback to parent to update user list and localStorage
    setIsLoading(false);
    setIsOpen(false); // Close dialog on success
    // Reset form
    setName("");
    setEmail("");
    setRole("Guru");
    setPassword("");
    toast({ title: "Pengguna Ditambahkan", description: `${name} telah berhasil ditambahkan.` });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>Masukkan detail untuk pengguna baru. Kata sandi akan di-generate otomatis (dalam sistem nyata).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name-add">Nama Lengkap</Label>
              <Input id="name-add" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-add">Alamat Email</Label>
              <Input id="email-add" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role-add">Peran</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role-add">
                  <SelectValue placeholder="Pilih peran pengguna" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    // SuperAdmin should only be assignable by SuperAdmin from a different interface potentially
                    (adminUser?.role === "SuperAdmin" || r.value !== "SuperAdmin") &&
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password-add">Kata Sandi (Sementara)</Label>
              <Input id="password-add" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 karakter" required />
               <p className="text-xs text-muted-foreground">Untuk demo, kata sandi ini bisa diisi bebas. Di sistem nyata, ini akan lebih aman.</p>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
