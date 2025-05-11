
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
import type { PrintOptionsModulAjar } from "@/types";
import { Settings2, Printer } from "lucide-react";

interface PrintOptionsModulAjarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultOptions: PrintOptionsModulAjar;
  onSubmit: (options: PrintOptionsModulAjar) => void;
  hasSchoolProfile: boolean;
}

export function PrintOptionsModulAjarDialog({
  isOpen,
  onOpenChange,
  defaultOptions,
  onSubmit,
  hasSchoolProfile,
}: PrintOptionsModulAjarDialogProps) {
  const [options, setOptions] = useState<PrintOptionsModulAjar>(defaultOptions);

  useEffect(() => {
    const initialOpts = { ...defaultOptions };
    if (!hasSchoolProfile) {
      initialOpts.showKopSurat = false;
    }
    setOptions(initialOpts);
  }, [defaultOptions, isOpen, hasSchoolProfile]);

  const handleCheckboxChange = (optionKey: keyof PrintOptionsModulAjar) => {
    setOptions((prev) => {
      const newOpt = !prev[optionKey];
      const updatedOptions = { ...prev, [optionKey]: newOpt };

      // Handle dependent checkboxes for Kegiatan Pembelajaran
      if (optionKey === 'showMAKomponenInti_KegiatanPembelajaran') {
        updatedOptions.showMAKomponenInti_Kegiatan_Pendahuluan = newOpt;
        updatedOptions.showMAKomponenInti_Kegiatan_Inti = newOpt;
        updatedOptions.showMAKomponenInti_Kegiatan_Penutup = newOpt;
      } else if (['showMAKomponenInti_Kegiatan_Pendahuluan', 'showMAKomponenInti_Kegiatan_Inti', 'showMAKomponenInti_Kegiatan_Penutup'].includes(optionKey)) {
        if (newOpt) { // if any sub-option is checked, check parent
          updatedOptions.showMAKomponenInti_KegiatanPembelajaran = true;
        } else if (!updatedOptions.showMAKomponenInti_Kegiatan_Pendahuluan && !updatedOptions.showMAKomponenInti_Kegiatan_Inti && !updatedOptions.showMAKomponenInti_Kegiatan_Penutup) {
          // if all sub-options are unchecked, uncheck parent
          updatedOptions.showMAKomponenInti_KegiatanPembelajaran = false;
        }
      }

      // Handle dependent checkboxes for Asesmen
      if (optionKey === 'showMAKomponenInti_Asesmen') {
        updatedOptions.showMAKomponenInti_Asesmen_Diagnostik = newOpt;
        updatedOptions.showMAKomponenInti_Asesmen_Formatif = newOpt;
        updatedOptions.showMAKomponenInti_Asesmen_Sumatif = newOpt;
      } else if (['showMAKomponenInti_Asesmen_Diagnostik', 'showMAKomponenInti_Asesmen_Formatif', 'showMAKomponenInti_Asesmen_Sumatif'].includes(optionKey)) {
         if (newOpt) {
            updatedOptions.showMAKomponenInti_Asesmen = true;
         } else if (!updatedOptions.showMAKomponenInti_Asesmen_Diagnostik && !updatedOptions.showMAKomponenInti_Asesmen_Formatif && !updatedOptions.showMAKomponenInti_Asesmen_Sumatif) {
            updatedOptions.showMAKomponenInti_Asesmen = false;
         }
      }
      return updatedOptions;
    });
  };

  const handleSubmit = () => {
    onSubmit(options);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Atur Opsi Cetak Modul Ajar (Kurikulum Merdeka)
          </DialogTitle>
          <DialogDescription>
            Pilih bagian mana saja dari Modul Ajar yang ingin Anda sertakan dalam hasil cetak.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] py-4 pr-3">
          <div className="grid gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showKopSuratMA"
                checked={options.showKopSurat}
                onCheckedChange={() => handleCheckboxChange("showKopSurat")}
                disabled={!hasSchoolProfile}
              />
              <Label htmlFor="showKopSuratMA" className={!hasSchoolProfile ? "text-muted-foreground" : ""}>
                Tampilkan Kop Surat Sekolah {!hasSchoolProfile && "(Profil Sekolah belum diatur)"}
              </Label>
            </div>
            <hr className="my-2" />

            <Label className="font-semibold text-md block">Informasi Umum:</Label>
            <div className="pl-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAIdentitas" checked={options.showMAIdentitas} onCheckedChange={() => handleCheckboxChange("showMAIdentitas")} />
                <Label htmlFor="showMAIdentitas">Identitas Modul</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKompetensiAwal" checked={options.showMAKompetensiAwal} onCheckedChange={() => handleCheckboxChange("showMAKompetensiAwal")} />
                <Label htmlFor="showMAKompetensiAwal">Kompetensi Awal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAProfilPelajarPancasila" checked={options.showMAProfilPelajarPancasila} onCheckedChange={() => handleCheckboxChange("showMAProfilPelajarPancasila")} />
                <Label htmlFor="showMAProfilPelajarPancasila">Profil Pelajar Pancasila</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMASaranaPrasarana" checked={options.showMASaranaPrasarana} onCheckedChange={() => handleCheckboxChange("showMASaranaPrasarana")} />
                <Label htmlFor="showMASaranaPrasarana">Sarana dan Prasarana</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMATargetPesertaDidik" checked={options.showMATargetPesertaDidik} onCheckedChange={() => handleCheckboxChange("showMATargetPesertaDidik")} />
                <Label htmlFor="showMATargetPesertaDidik">Target Peserta Didik</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAModelPembelajaran" checked={options.showMAModelPembelajaran} onCheckedChange={() => handleCheckboxChange("showMAModelPembelajaran")} />
                <Label htmlFor="showMAModelPembelajaran">Model Pembelajaran</Label>
              </div>
            </div>
            <hr className="my-2" />

            <Label className="font-semibold text-md block">Komponen Inti:</Label>
            <div className="pl-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_TujuanPembelajaran" checked={options.showMAKomponenInti_TujuanPembelajaran} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_TujuanPembelajaran")} />
                <Label htmlFor="showMAKomponenInti_TujuanPembelajaran">Tujuan Pembelajaran</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_PemahamanBermakna" checked={options.showMAKomponenInti_PemahamanBermakna} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_PemahamanBermakna")} />
                <Label htmlFor="showMAKomponenInti_PemahamanBermakna">Pemahaman Bermakna</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_PertanyaanPemantik" checked={options.showMAKomponenInti_PertanyaanPemantik} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_PertanyaanPemantik")} />
                <Label htmlFor="showMAKomponenInti_PertanyaanPemantik">Pertanyaan Pemantik</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_KegiatanPembelajaran" checked={options.showMAKomponenInti_KegiatanPembelajaran} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_KegiatanPembelajaran")} />
                <Label htmlFor="showMAKomponenInti_KegiatanPembelajaran" className="font-medium">Kegiatan Pembelajaran (Semua)</Label>
              </div>
              <div className="pl-6 space-y-2">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="showMAKomponenInti_Kegiatan_Pendahuluan" checked={options.showMAKomponenInti_Kegiatan_Pendahuluan} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Kegiatan_Pendahuluan")} />
                    <Label htmlFor="showMAKomponenInti_Kegiatan_Pendahuluan">Pendahuluan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showMAKomponenInti_Kegiatan_Inti" checked={options.showMAKomponenInti_Kegiatan_Inti} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Kegiatan_Inti")} />
                    <Label htmlFor="showMAKomponenInti_Kegiatan_Inti">Kegiatan Inti</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showMAKomponenInti_Kegiatan_Penutup" checked={options.showMAKomponenInti_Kegiatan_Penutup} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Kegiatan_Penutup")} />
                    <Label htmlFor="showMAKomponenInti_Kegiatan_Penutup">Penutup</Label>
                  </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_Asesmen" checked={options.showMAKomponenInti_Asesmen} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Asesmen")} />
                <Label htmlFor="showMAKomponenInti_Asesmen" className="font-medium">Asesmen (Semua)</Label>
              </div>
              <div className="pl-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showMAKomponenInti_Asesmen_Diagnostik" checked={options.showMAKomponenInti_Asesmen_Diagnostik} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Asesmen_Diagnostik")} />
                    <Label htmlFor="showMAKomponenInti_Asesmen_Diagnostik">Diagnostik</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showMAKomponenInti_Asesmen_Formatif" checked={options.showMAKomponenInti_Asesmen_Formatif} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Asesmen_Formatif")} />
                    <Label htmlFor="showMAKomponenInti_Asesmen_Formatif">Formatif</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showMAKomponenInti_Asesmen_Sumatif" checked={options.showMAKomponenInti_Asesmen_Sumatif} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Asesmen_Sumatif")} />
                    <Label htmlFor="showMAKomponenInti_Asesmen_Sumatif">Sumatif</Label>
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_PengayaanRemedial" checked={options.showMAKomponenInti_PengayaanRemedial} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_PengayaanRemedial")} />
                <Label htmlFor="showMAKomponenInti_PengayaanRemedial">Pengayaan dan Remedial</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMAKomponenInti_Refleksi" checked={options.showMAKomponenInti_Refleksi} onCheckedChange={() => handleCheckboxChange("showMAKomponenInti_Refleksi")} />
                <Label htmlFor="showMAKomponenInti_Refleksi">Refleksi Peserta Didik dan Guru</Label>
              </div>
            </div>
            <hr className="my-2" />

            <Label className="font-semibold text-md block">Lampiran:</Label>
            <div className="pl-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="showMALampiran_LKPD" checked={options.showMALampiran_LKPD} onCheckedChange={() => handleCheckboxChange("showMALampiran_LKPD")} />
                <Label htmlFor="showMALampiran_LKPD">Lembar Kerja Peserta Didik (LKPD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMALampiran_BahanBacaan" checked={options.showMALampiran_BahanBacaan} onCheckedChange={() => handleCheckboxChange("showMALampiran_BahanBacaan")} />
                <Label htmlFor="showMALampiran_BahanBacaan">Bahan Bacaan Guru dan Siswa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMALampiran_Glosarium" checked={options.showMALampiran_Glosarium} onCheckedChange={() => handleCheckboxChange("showMALampiran_Glosarium")} />
                <Label htmlFor="showMALampiran_Glosarium">Glosarium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showMALampiran_DaftarPustaka" checked={options.showMALampiran_DaftarPustaka} onCheckedChange={() => handleCheckboxChange("showMALampiran_DaftarPustaka")} />
                <Label htmlFor="showMALampiran_DaftarPustaka">Daftar Pustaka</Label>
              </div>
            </div>

          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-0 pt-4">
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

