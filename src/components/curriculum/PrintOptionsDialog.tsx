
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
import type { PrintOptions, AnyCurriculumItem, CurriculumFramework } from "@/types";
import { Settings2, Printer } from "lucide-react";

interface PrintOptionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: AnyCurriculumItem['type'];
  itemCurriculumType: CurriculumFramework; 
  defaultOptions: PrintOptions;
  onSubmit: (options: PrintOptions) => void;
  hasSchoolProfile: boolean; 
}

export function PrintOptionsDialog({
  isOpen,
  onOpenChange,
  itemType,
  itemCurriculumType, 
  defaultOptions,
  onSubmit,
  hasSchoolProfile, 
}: PrintOptionsDialogProps) {
  const [options, setOptions] = useState<PrintOptions>(defaultOptions);

  useEffect(() => {
    const initialOpts = {...defaultOptions};
    if (!hasSchoolProfile) {
      initialOpts.showKopSurat = false;
    }
    
    // Reset all RPP specific to false initially
    initialOpts.showRPPCapaianPembelajaran = false;
    initialOpts.showRPPPemahamanBermakna = false;
    initialOpts.showRPPPertanyaanPemantik = false;
    initialOpts.showRPPDifferentiationStrategies = false;
    initialOpts.showRPPProfilPelajarPancasila = false;
    initialOpts.showRPPBidangKeahlian = false;
    initialOpts.showRPPProgramKeahlian = false;
    initialOpts.showRPPSK = false;
    initialOpts.showRPPKI = false;
    initialOpts.showRPPKD = false;
    initialOpts.showRPPIPK = false;
    initialOpts.showRPPMetodePembelajaran = false;

    if (itemType === 'RPP') { // Covers RPP, Modul Ajar, ATP
        initialOpts.showRPPAlokasiWaktu = true; 
        initialOpts.showRPPLearningObjectives = true; // Always show TP for ATP or objectives for RPP

        if (itemCurriculumType === "Kurikulum Merdeka") {
            initialOpts.showRPPBidangKeahlian = true;
            initialOpts.showRPPProgramKeahlian = true;
            initialOpts.showRPPCapaianPembelajaran = true;
            initialOpts.showRPPProfilPelajarPancasila = true;
            // These are more Modul Ajar specific, can be optional for pure ATP print
            initialOpts.showRPPPemahamanBermakna = true; 
            initialOpts.showRPPPertanyaanPemantik = true;
            initialOpts.showRPPDifferentiationStrategies = true;
            initialOpts.showRPPLangkahPendahuluan = true;
            initialOpts.showRPPLangkahKegiatanInti = true;
            initialOpts.showRPPLangkahPenutup = true;
            initialOpts.showRPPAssessment = true;
            initialOpts.showRPPMaterials = true;
        } else if (itemCurriculumType === "K-13") {
            initialOpts.showRPPKI = true;
            initialOpts.showRPPKD = true;
            initialOpts.showRPPIPK = true;
            initialOpts.showRPPMetodePembelajaran = true;
            initialOpts.showRPPLangkahPendahuluan = true;
            initialOpts.showRPPLangkahKegiatanInti = true;
            initialOpts.showRPPLangkahPenutup = true;
            initialOpts.showRPPAssessment = true;
            initialOpts.showRPPMaterials = true;
        } else if (itemCurriculumType === "KTSP 2006") {
            initialOpts.showRPPSK = true;
            initialOpts.showRPPKD = true;
            initialOpts.showRPPIPK = true;
            initialOpts.showRPPMetodePembelajaran = true;
            initialOpts.showRPPLangkahPendahuluan = true;
            initialOpts.showRPPLangkahKegiatanInti = true;
            initialOpts.showRPPLangkahPenutup = true;
            initialOpts.showRPPAssessment = true;
            initialOpts.showRPPMaterials = true;
        }
    } else if (itemType === 'PROTA') {
        if (itemCurriculumType === "Kurikulum Merdeka") {
            initialOpts.showPROTACapaianPembelajaran = true;
            initialOpts.showPROTAFokusP5 = true;
        }
    }
    setOptions(initialOpts);
  }, [defaultOptions, isOpen, hasSchoolProfile, itemType, itemCurriculumType]);

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
        <Checkbox id="showRPPLearningObjectives" checked={options.showRPPLearningObjectives} onCheckedChange={() => handleCheckboxChange("showRPPLearningObjectives")} />
        <Label htmlFor="showRPPLearningObjectives">
            {itemCurriculumType === "Kurikulum Merdeka" ? "Tujuan Pembelajaran (TP) dalam ATP" : "Tujuan Pembelajaran"}
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPAlokasiWaktu" checked={options.showRPPAlokasiWaktu} onCheckedChange={() => handleCheckboxChange("showRPPAlokasiWaktu")} />
        <Label htmlFor="showRPPAlokasiWaktu">Alokasi Waktu (JP)</Label>
      </div>

      {itemCurriculumType === "Kurikulum Merdeka" && (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox id="showRPPBidangKeahlian" checked={options.showRPPBidangKeahlian} onCheckedChange={() => handleCheckboxChange("showRPPBidangKeahlian")} />
            <Label htmlFor="showRPPBidangKeahlian">Bidang Keahlian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="showRPPProgramKeahlian" checked={options.showRPPProgramKeahlian} onCheckedChange={() => handleCheckboxChange("showRPPProgramKeahlian")} />
            <Label htmlFor="showRPPProgramKeahlian">Program Keahlian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="showRPPCapaianPembelajaran" checked={options.showRPPCapaianPembelajaran} onCheckedChange={() => handleCheckboxChange("showRPPCapaianPembelajaran")} />
            <Label htmlFor="showRPPCapaianPembelajaran">Capaian Pembelajaran (CP)</Label>
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="showRPPProfilPelajarPancasila" checked={options.showRPPProfilPelajarPancasila} onCheckedChange={() => handleCheckboxChange("showRPPProfilPelajarPancasila")} />
            <Label htmlFor="showRPPProfilPelajarPancasila">Fokus Profil Pelajar Pancasila</Label>
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
            <Checkbox id="showRPPDifferentiationStrategies" checked={options.showRPPDifferentiationStrategies} onCheckedChange={() => handleCheckboxChange("showRPPDifferentiationStrategies")} />
            <Label htmlFor="showRPPDifferentiationStrategies">Strategi Diferensiasi</Label>
          </div>
        </>
      )}
      
      {(itemCurriculumType === "K-13" || itemCurriculumType === "KTSP 2006") && (
          <>
            {itemCurriculumType === "KTSP 2006" && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="showRPPSK" checked={options.showRPPSK} onCheckedChange={() => handleCheckboxChange("showRPPSK")} />
                    <Label htmlFor="showRPPSK">Standar Kompetensi (SK)</Label>
                </div>
            )}
            {itemCurriculumType === "K-13" && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="showRPPKI" checked={options.showRPPKI} onCheckedChange={() => handleCheckboxChange("showRPPKI")} />
                    <Label htmlFor="showRPPKI">Kompetensi Inti (KI)</Label>
                </div>
            )}
            <div className="flex items-center space-x-2">
                <Checkbox id="showRPPKD" checked={options.showRPPKD} onCheckedChange={() => handleCheckboxChange("showRPPKD")} />
                <Label htmlFor="showRPPKD">Kompetensi Dasar (KD)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="showRPPIPK" checked={options.showRPPIPK} onCheckedChange={() => handleCheckboxChange("showRPPIPK")} />
                <Label htmlFor="showRPPIPK">Indikator Pencapaian Kompetensi (IPK)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="showRPPMetodePembelajaran" checked={options.showRPPMetodePembelajaran} onCheckedChange={() => handleCheckboxChange("showRPPMetodePembelajaran")} />
                <Label htmlFor="showRPPMetodePembelajaran">Metode Pembelajaran</Label>
            </div>
          </>
      )}
      <Label className="font-medium text-sm pt-2 block">Langkah Pembelajaran (Modul Ajar/RPP):</Label>
      <div className="pl-4 space-y-2">
        <div className="flex items-center space-x-2">
            <Checkbox id="showRPPLangkahPendahuluan" checked={options.showRPPLangkahPendahuluan} onCheckedChange={() => handleCheckboxChange("showRPPLangkahPendahuluan")} />
            <Label htmlFor="showRPPLangkahPendahuluan">Pendahuluan</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="showRPPLangkahKegiatanInti" checked={options.showRPPLangkahKegiatanInti} onCheckedChange={() => handleCheckboxChange("showRPPLangkahKegiatanInti")} />
            <Label htmlFor="showRPPLangkahKegiatanInti">Kegiatan Inti</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="showRPPLangkahPenutup" checked={options.showRPPLangkahPenutup} onCheckedChange={() => handleCheckboxChange("showRPPLangkahPenutup")} />
            <Label htmlFor="showRPPLangkahPenutup">Penutup</Label>
        </div>
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox id="showRPPAssessment" checked={options.showRPPAssessment} onCheckedChange={() => handleCheckboxChange("showRPPAssessment")} />
        <Label htmlFor="showRPPAssessment">Asesmen/Penilaian</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showRPPMaterials" checked={options.showRPPMaterials} onCheckedChange={() => handleCheckboxChange("showRPPMaterials")} />
        <Label htmlFor="showRPPMaterials">Media/Sumber Belajar</Label>
      </div>
    </>
  );

  const renderPROTAOptions = () => (
    <>
      {itemCurriculumType === "Kurikulum Merdeka" && (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox id="showPROTACapaianPembelajaran" checked={options.showPROTACapaianPembelajaran} onCheckedChange={() => handleCheckboxChange("showPROTACapaianPembelajaran")} />
            <Label htmlFor="showPROTACapaianPembelajaran">Capaian Pembelajaran Umum Tahunan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="showPROTAFokusP5" checked={options.showPROTAFokusP5} onCheckedChange={() => handleCheckboxChange("showPROTAFokusP5")} />
            <Label htmlFor="showPROTAFokusP5">Fokus Profil Pelajar Pancasila</Label>
          </div>
        </>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox id="showPROTASemester1" checked={options.showPROTASemester1} onCheckedChange={() => handleCheckboxChange("showPROTASemester1")} />
        <Label htmlFor="showPROTASemester1">Komponen Semester 1 (Topik, Elemen CP/KD, Alokasi Waktu JP)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showPROTASemester2" checked={options.showPROTASemester2} onCheckedChange={() => handleCheckboxChange("showPROTASemester2")} />
        <Label htmlFor="showPROTASemester2">Komponen Semester 2 (Topik, Elemen CP/KD, Alokasi Waktu JP)</Label>
      </div>
    </>
  );

  const renderPromesOptions = () => (
    <>
       <div className="flex items-center space-x-2">
        <Checkbox id="showPromesCapaianUmum" checked={options.showPromesCapaianUmum} onCheckedChange={() => handleCheckboxChange("showPromesCapaianUmum")} />
        <Label htmlFor="showPromesCapaianUmum">
            {itemCurriculumType === "Kurikulum Merdeka" ? "Capaian Pembelajaran Umum Semester" : "Rangkuman SK/KD Utama Semester"}
        </Label>
      </div>
       <div className="flex items-center space-x-2">
        <Checkbox id="showPromesAlokasiTotal" checked={options.showPromesAlokasiTotal} onCheckedChange={() => handleCheckboxChange("showPromesAlokasiTotal")} />
        <Label htmlFor="showPromesAlokasiTotal">Alokasi Waktu Total Semester (JP)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="showPromesKomponenMingguan" checked={options.showPromesKomponenMingguan} onCheckedChange={() => handleCheckboxChange("showPromesKomponenMingguan")} />
        <Label htmlFor="showPromesKomponenMingguan">Rincian Komponen Mingguan (termasuk Alokasi Waktu JP per minggu)</Label>
      </div>
    </>
  );

  const documentName = itemType === 'RPP' ? (itemCurriculumType === "Kurikulum Merdeka" ? "ATP/Modul Ajar" : "RPP") : itemType;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Atur Opsi Cetak {documentName} ({itemCurriculumType})
          </DialogTitle>
          <DialogDescription>
            Pilih bagian mana saja dari {documentName} yang ingin Anda sertakan dalam hasil cetak.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4 pr-3">
          <div className="grid gap-3">
            <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showKopSurat" 
                  checked={options.showKopSurat} 
                  onCheckedChange={() => handleCheckboxChange("showKopSurat")}
                  disabled={!hasSchoolProfile} 
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

