
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, CheckIcon } from "lucide-react";
import type { Teacher, Subject } from "@/types";

interface TeacherFormFieldsProps {
  formData: Partial<Teacher>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allSubjects: Subject[];
  handleSubjectChange: (subjectIds: string[]) => void;
}

export function TeacherFormFields({ 
  formData, 
  handleChange, 
  allSubjects,
  handleSubjectChange 
}: TeacherFormFieldsProps) {
  
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(formData.subjectIds || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [openPopover, setOpenPopover] = useState(false);

  useEffect(() => {
    setSelectedSubjectIds(formData.subjectIds || []);
  }, [formData.subjectIds]);

  const toggleSubject = (subjectId: string) => {
    const newSelectedIds = selectedSubjectIds.includes(subjectId)
      ? selectedSubjectIds.filter(id => id !== subjectId)
      : [...selectedSubjectIds, subjectId];
    setSelectedSubjectIds(newSelectedIds);
    handleSubjectChange(newSelectedIds);
  };

  const filteredSubjects = allSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSubjectsText = selectedSubjectIds.length > 0
    ? selectedSubjectIds.map(id => allSubjects.find(s => s.id === id)?.name || id).join(", ")
    : "Pilih Mata Pelajaran";

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-base font-medium">Nama Lengkap Guru</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="cth., Dr. Anisa Wulandari, S.Pd., M.Pd."
          required
          className="text-base h-11 rounded-md focus:border-primary"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nip" className="text-base font-medium">NIP (Nomor Induk Pegawai) (Opsional)</Label>
        <Input
          id="nip"
          name="nip"
          value={formData.nip || ""}
          onChange={handleChange}
          placeholder="cth., 198001012005012001"
          className="text-base h-11 rounded-md focus:border-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-base font-medium">Mata Pelajaran yang Diampu</Label>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPopover}
              className="w-full justify-between text-base h-11 rounded-md focus:border-primary font-normal"
            >
              <span className="truncate max-w-[calc(100%-30px)]">
                {selectedSubjectsText}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-72">
            <div className="p-2">
              <Input
                placeholder="Cari mata pelajaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 rounded-md mb-2"
              />
            </div>
            <ScrollArea className="max-h-56">
              <div className="space-y-1 p-2 pt-0">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map(subject => (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
                      onClick={() => toggleSubject(subject.id)}
                    >
                      <Checkbox
                        id={`subject-${subject.id}`}
                        checked={selectedSubjectIds.includes(subject.id)}
                        onCheckedChange={() => toggleSubject(subject.id)}
                      />
                      <Label htmlFor={`subject-${subject.id}`} className="flex-1 cursor-pointer text-sm font-normal">
                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-sm text-muted-foreground text-center">
                    {allSubjects.length === 0 ? "Belum ada mata pelajaran. Tambahkan dulu di Master Data." : "Mata pelajaran tidak ditemukan."}
                  </p>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      {/* Optional: Link to User account if managing separate Teacher entities from User entities */}
      {/* <div className="space-y-1.5">
        <Label htmlFor="userId" className="text-base font-medium">Akun Pengguna Terkait (Opsional)</Label>
        <Input
          id="userId"
          name="userId"
          value={formData.userId || ""}
          onChange={handleChange}
          placeholder="ID Akun Pengguna (jika ada)"
          className="text-base h-11 rounded-md focus:border-primary"
        />
      </div> */}
    </>
  );
}
