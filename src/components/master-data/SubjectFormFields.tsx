
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Subject } from "@/types";

interface SubjectFormFieldsProps {
  formData: Partial<Subject>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SubjectFormFields({ formData, handleChange }: SubjectFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-base font-medium">Nama Mata Pelajaran</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="cth., Matematika Peminatan"
          required
          className="text-base h-11 rounded-md focus:border-primary"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="code" className="text-base font-medium">Kode Mata Pelajaran (Opsional)</Label>
        <Input
          id="code"
          name="code"
          value={formData.code || ""}
          onChange={handleChange}
          placeholder="cth., MTK-MINAT"
          className="text-base h-11 rounded-md focus:border-primary"
        />
      </div>
    </>
  );
}
