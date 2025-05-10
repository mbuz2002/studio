
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SchoolClass, Teacher } from "@/types";

interface ClassFormFieldsProps {
  formData: Partial<SchoolClass>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  allTeachers: Teacher[];
}

// Example grade levels, adjust as needed based on SchoolProfile.jenjangPendidikan
const exampleGradeLevels = [
    "PAUD - Kelompok Bermain", "PAUD - TK A", "PAUD - TK B",
    "I", "II", "III", "IV", "V", "VI", // SD/MI
    "VII", "VIII", "IX", // SMP/MTs
    "X", "XI", "XII", // SMA/MA/SMK/MAK
    "Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F", // KurMer
    "Dasar (SLB)", "Menengah (SLB)", "Atas (SLB)",
    "Paket A", "Paket B", "Paket C"
];

const NO_HOMEROOM_VALUE = "_NO_HOMEROOM_";

export function ClassFormFields({ 
    formData, 
    handleChange, 
    handleSelectChange,
    allTeachers 
}: ClassFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
            <Label htmlFor="name" className="text-base font-medium">Nama Kelas/Rombel</Label>
            <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="cth., Kelas X IPA 1 atau Fase A Kelompok Melati"
            required
            className="text-base h-11 rounded-md focus:border-primary"
            />
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="gradeLevel" className="text-base font-medium">Jenjang/Tingkat</Label>
            <Select 
              value={formData.gradeLevel || ""} 
              onValueChange={(value) => handleSelectChange('gradeLevel', value === "placeholder-grade" ? "" : value)}
            >
              <SelectTrigger id="gradeLevel" className="text-base h-11 rounded-md">
                <SelectValue placeholder="Pilih Jenjang/Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder-grade" disabled>Pilih Jenjang/Tingkat</SelectItem>
                {exampleGradeLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="homeroomTeacherId" className="text-base font-medium">Wali Kelas (Opsional)</Label>
        <Select 
          value={formData.homeroomTeacherId || ""} 
          onValueChange={(value) => handleSelectChange('homeroomTeacherId', (value === "placeholder-teacher" || value === NO_HOMEROOM_VALUE) ? "" : value)}
        >
          <SelectTrigger id="homeroomTeacherId" className="text-base h-11 rounded-md">
            <SelectValue placeholder="Pilih Wali Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder-teacher" disabled>Pilih Wali Kelas</SelectItem>
            <SelectItem value={NO_HOMEROOM_VALUE}>Tidak Ada Wali Kelas</SelectItem>
            {allTeachers.length === 0 && <SelectItem value="no-teachers" disabled>Belum ada data guru</SelectItem>}
            {allTeachers.map(teacher => (
              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-base font-medium">Catatan Tambahan (Opsional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Informasi tambahan mengenai kelas ini..."
          rows={3}
          className="text-base rounded-md focus:border-primary"
        />
      </div>
    </>
  );
}
