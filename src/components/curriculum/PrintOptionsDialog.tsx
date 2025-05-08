
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PrintOptions, AnyCurriculumItem } from "@/types";
import { Settings2, Printer } from "lucide-react";

interface PrintOptionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: AnyCurriculumItem['type'];
  defaultOptions: PrintOptions;
  onSubmit: (options: PrintOptions) => void;
  hasSchoolProfile: boolean; // New prop
}

export function PrintOptionsDialog({
  isOpen,
  onOpenChange,
  itemType,
  defaultOptions,
  onSubmit,
  hasSchoolProfile, // Use new prop
}: PrintOptionsDialogProps) {
  const [options, setOptions] = useState<PrintOptions>(defaultOptions);

  useEffect(() => {
    // Ensure showKopSurat is false if hasSchoolProfile is false when dialog opens
    const initialOpts = {...defaultOptions};
    if (!hasSchoolProfile) {
      initialOpts.showKopSurat = false;
    }
    setOptions(initialOpts);
  }, [defaultOptions, isOpen, hasSchoolProfile]);

  const handleCheckboxChange = (optionKey: keyof PrintOptions) => {
    setOptions((prev) => ({
      ...prev,
      [optionKey]: !prev[optionKey],
    }));
  };

  const handleSubmit = () => {
    onSubmit(options);
    onOpenChange(false);
  };

  const renderRPPOptions = () => (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPTujuanPembelajaran" checked={options.showRPPTujuanPembelajaran} onCheckedChange={() => handleCheckboxChange("showRPPTujuanPembelajaran")} />
        <Label htmlFor="showRPPTujuanPembelajaran">Tujuan Pembelajaran</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPPemahamanBermakna" checked={options.showRPPPemahamanBermakna} onCheckedChange={() => handleCheckboxChange("showRPPPemahamanBermakna")} />
        <Label htmlFor="showRPPPemahamanBermakna">Pemahaman Bermakna</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPPertanyaanPemantik" checked={options.showRPPPertanyaanPemantik} onCheckedChange={() => handleCheckboxChange("showRPPPertanyaanPemantik")} />
        <Label htmlFor="showRPPPertanyaanPemantik">Pertanyaan Pemantik</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPLangkahPendahuluan" checked={options.showRPPLangkahPendahuluan} onCheckedChange={() => handleCheckboxChange("showRPPLangkahPendahuluan")} />
        <Label htmlFor="showRPPLangkahPendahuluan">Langkah: Pendahuluan</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPLangkahKegiatanInti" checked={options.showRPPLangkahKegiatanInti} onCheckedChange={() => handleCheckboxChange("showRPPLangkahKegiatanInti")} />
        <Label htmlFor="showRPPLangkahKegiatanInti">Langkah: Kegiatan Inti</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPLangkahPenutup" checked={options.showRPPLangkahPenutup} onCheckedChange={() => handleCheckboxChange("showRPPLangkahPenutup")} />
        <Label htmlFor="showRPPLangkahPenutup">Langkah: Penutup</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPAsesmen" checked={options.showRPPAsesmen} onCheckedChange={() => handleCheckboxChange("showRPPAsesmen")} />
        <Label htmlFor="showRPPAsesmen">Asesmen/Penilaian</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPStrategiDiferensiasi" checked={options.showRPPStrategiDiferensiasi} onCheckedChange={() => handleCheckboxChange("showRPPStrategiDiferensiasi")} />
        <Label htmlFor="showRPPStrategiDiferensiasi">Strategi Diferensiasi</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPMediaSumberBelajar" checked={options.showRPPMediaSumberBelajar} onCheckedChange={() => handleCheckboxChange("showRPPMediaSumberBelajar")} />
        <Label htmlFor="showRPPMediaSumberBelajar">Media/Sumber Belajar</Label>
      </div>
    </>
  );

  const renderPROTAOptions = () => (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox id="showPROTAFokusP5" checked={options.showPROTAFokusP5} onCheckedChange={() => handleCheckboxChange("showPROTAFokusP5")} />
        <Label htmlFor="showPROTAFokusP5">Fokus Profil Pelajar Pancasila</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showPROTASemester1" checked={options.showPROTASemester1} onCheckedChange={() => handleCheckboxChange("showPROTASemester1")} />
        <Label htmlFor="showPROTASemester1">Komponen Semester 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showPROTASemester2" checked={options.showPROTASemester2} onCheckedChange={() => handleCheckboxChange("showPROTASemester2")} />
        <Label htmlFor="showPROTASemester2">Komponen Semester 2</Label>
      </div>
    </>
  );

  const renderPromesOptions = () => (
    <>
       <div className="flex items-center space-x-2">
        <Checkbox id="showPromesCapaianUmum" checked={options.showPromesCapaianUmum} onCheckedChange={() => handleCheckboxChange("showPromesCapaianUmum")} />
        <Label htmlFor="showPromesCapaianUmum">Capaian Pembelajaran Umum</Label>
      </div>
       <div className="flex items-center space-x-2">
        <Checkbox id="showPromesAlokasiTotal" checked={options.showPromesAlokasiTotal} onCheckedChange={() => handleCheckboxChange("showPromesAlokasiTotal")} />
        <Label htmlFor="showPromesAlokasiTotal">Alokasi Waktu Total</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showPromesKomponenMingguan" checked={options.showPromesKomponenMingguan} onCheckedChange={() => handleCheckboxChange("showPromesKomponenMingguan")} />
        <Label htmlFor="showPromesKomponenMingguan">Rincian Komponen Mingguan</Label>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Atur Opsi Cetak Dokumen
          </DialogTitle>
          <DialogDescription>
            Pilih bagian mana saja dari {itemType} yang ingin Anda sertakan dalam hasil cetak.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4 pr-3">
          <div className="grid gap-3">
            <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showKopSurat" 
                  checked={options.showKopSurat} 
                  onCheckedChange={() => handleCheckboxChange("showKopSurat")}
                  disabled={!hasSchoolProfile} // Disable if no profile
                />
                <Label htmlFor="showKopSurat" className={!hasSchoolProfile ? "text-muted-foreground" : ""}>
                  Tampilkan Kop Surat Sekolah {!hasSchoolProfile && "(Profil Sekolah belum diatur)"}
                </Label>
            </div>
            <hr className="my-2"/>
            {itemType === 'RPP' && renderRPPOptions()}
            {itemType === 'PROTA' && renderPROTAOptions()}
            {itemType === 'Promes' && renderPromesOptions()}
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            <Printer className="mr-2 h-4 w-4" />
            Lanjutkan ke Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

