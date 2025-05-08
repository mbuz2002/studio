
"use client";

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

interface AddUserDialogProps {
  onUserAdded: (newUser: User) => void;
}

const roles: { value: UserRole; label: string }[] = [
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
  const [password, setPassword] = useState(""); // Dummy password
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!name || !email || !role || !password) {
      toast({ title: "Data Tidak Lengkap", description: "Harap isi semua kolom.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: `https://picsum.photos/seed/${email}/100/100`, // Generate avatar based on email/name
    };

    onUserAdded(newUser);
    setIsLoading(false);
    setIsOpen(false);
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
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password-add">Kata Sandi (Sementara)</Label>
              <Input id="password-add" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 karakter" required />
               <p className="text-xs text-muted-foreground">Untuk demo, kata sandi ini bisa diisi bebas.</p>
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
