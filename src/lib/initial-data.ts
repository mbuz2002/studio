
import type { LessonPlan, AnnualProgram, SemesterProgram, ModulAjar, Subject, Teacher, SchoolClass, User, School, AcademicEvent } from '@/types';
import { DEFAULT_FEATURE_SETTINGS } from '@/types'; // Import default feature settings

// Note: These IDs should be unique if you plan to merge them later.
// For this setup, they will be assigned to the defaultSchoolId.

export const DEFAULT_SCHOOL_ID = "default-school-001";
export const SUPERADMIN_ID = "superadmin-001";
export const DEFAULT_ADMIN_ID = "default-admin-001";
export const DEFAULT_GURU_ID = "default-guru-001";


export const initialSuperAdminUser: User = {
  id: SUPERADMIN_ID,
  name: "Super Admin Utama",
  email: "superadmin@app.com",
  role: "SuperAdmin",
  avatarUrl: `https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff`,
  updatedAt: new Date().toISOString(),
  // No schoolId
};

const today = new Date();
const oneYearFromToday = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

export const initialDefaultSchool: School = {
  id: DEFAULT_SCHOOL_ID,
  name: "Sekolah Demo GUMPLA AI",
  jenjangPendidikan: "SMA/MA",
  alamat: "Jl. Edukasi Cendekia No. 1, Kota Cerdas",
  nomorTelepon: "021-555-0101",
  emailSekolah: "info@sekolahdemo.sch.id",
  namaKepalaSekolah: "Dr. H. Demo Pratama, M.Pd.",
  npsn: "99000001",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Tut_Wuri_Handayani_logo_old.svg/100px-Tut_Wuri_Handayani_logo_old.svg.png", // Placeholder logo
  kotaSekolah: "Kota Cerdas",
  subscriptionStatus: 'active',
  subscriptionStartDate: today.toISOString(),
  subscriptionEndDate: oneYearFromToday.toISOString(),
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  adminEmail: 'admin@sekolahdemo.sch.id',
  featureSettings: { ...DEFAULT_FEATURE_SETTINGS }, 
};

export const initialSchoolAdminUser: User = {
  id: DEFAULT_ADMIN_ID,
  name: "Admin Sekolah Demo",
  email: initialDefaultSchool.adminEmail!,
  role: "Admin",
  avatarUrl: `https://ui-avatars.com/api/?name=Admin+Sekolah&background=1EAAAD&color=fff`,
  schoolId: DEFAULT_SCHOOL_ID,
  updatedAt: new Date().toISOString(),
};

export const initialGuruUser: User = {
  id: DEFAULT_GURU_ID,
  name: "Guru Inovatif",
  email: "guru.inovatif@sekolahdemo.sch.id",
  role: "Guru",
  avatarUrl: `https://ui-avatars.com/api/?name=Guru+Inovatif&background=5E5E5E&color=fff`,
  schoolId: DEFAULT_SCHOOL_ID,
  updatedAt: new Date().toISOString(),
};


export const initialLessonPlansData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
  {
    type: "RPP",
    curriculumType: "Kurikulum Merdeka",
    title: "ATP Dasar-Dasar Animasi Fase F (Demo)",
    subject: "Animasi",
    gradeLevel: "Fase F (Kelas 11-12 SMA/MA/SMK/MAK)",
    topic: "Dasar-Dasar Keahlian Animasi",
    bidangKeahlian: "Seni dan Ekonomi Kreatif",
    programKeahlian: "Animasi",
    capaianPembelajaran: ["Pada akhir fase F, peserta didik mampu memahami prinsip dasar animasi.", "Peserta didik mampu membuat animasi sederhana menggunakan perangkat lunak."],
    learningObjectives: [
        "Memahami 12 prinsip dasar animasi.",
        "Mengidentifikasi jenis-jenis software animasi.",
        "Mempraktikkan pembuatan storyboard untuk animasi pendek.",
        "Membuat animasi objek bergerak sederhana (bola memantul)."
    ],
    profilPelajarPancasilaFocus: ["Kreatif", "Bernalar Kritis"],
    pemahamanBermakna: ["Animasi adalah media komunikasi visual yang kuat.", "Prinsip dasar animasi adalah kunci menghasilkan gerakan yang alami dan menarik."],
    pertanyaanPemantik: ["Bagaimana benda mati bisa terlihat hidup di layar?", "Apa saja langkah-langkah membuat film animasi pendek?"],
    langkahPembelajaran: {
      pendahuluan: ["Salam dan doa", "Apersepsi: Menampilkan contoh animasi pendek", "Menyampaikan tujuan dan alur pembelajaran ATP"],
      kegiatanInti: ["Diskusi kelompok: Menganalisis 12 prinsip animasi dari contoh video.", "Eksplorasi mandiri: Mencoba fitur dasar software animasi.", "Praktik terbimbing: Membuat storyboard.", "Proyek mini: Animasi bola memantul."],
      penutup: ["Refleksi: Apa tantangan terbesar dalam membuat animasi?", "Presentasi hasil proyek mini (sampling).", "Umpan balik dan kesimpulan."],
    },
    assessment: "Observasi keaktifan diskusi, Penilaian storyboard, Penilaian hasil animasi bola memantul (rubrik).",
    differentiationStrategies: ["Memberikan contoh storyboard yang lebih kompleks untuk siswa mahir.", "Memberikan template storyboard untuk siswa yang membutuhkan."],
    materials: "Komputer dengan software animasi (Blender/Adobe Animate), Proyektor, Video contoh animasi, Referensi 12 Prinsip Animasi.",
    alokasiWaktuJP: "72 JP",
  },
  {
    type: "RPP",
    curriculumType: "K-13",
    title: "RPP Proses Fotosintesis (K-13 Demo)",
    subject: "IPA",
    gradeLevel: "Kelas VII SMP",
    topic: "Fotosintesis",
    kompetensiInti: ["KI-3: Memahami pengetahuan...", "KI-4: Mencoba, mengolah, dan menyaji..."],
    kompetensiDasar: ["3.7 Menganalisis konsep energi...", "4.7 Menyajikan hasil penyelidikan..."],
    indikatorPencapaianKompetensi: ["Menjelaskan proses fotosintesis", "Mengidentifikasi faktor-faktor fotosintesis"],
    learningObjectives: ["Siswa dapat menjelaskan proses fotosintesis.", "Siswa dapat mengidentifikasi faktor fotosintesis."],
    metodePembelajaran: ["Diskusi", "Eksperimen"],
    langkahPembelajaran: {
      pendahuluan: ["Salam, doa, presensi", "Apersepsi"],
      kegiatanInti: ["Mengamati video", "Diskusi kelompok", "Presentasi"],
      penutup: ["Kesimpulan", "Refleksi"],
    },
    assessment: "Observasi, Tes tulis, Laporan praktikum.",
    materials: "Buku teks, Video animasi",
    alokasiWaktuJP: "3 JP",
  },
];

export const initialAnnualProgramsData: Omit<AnnualProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
  {
    type: "PROTA",
    curriculumType: "Kurikulum Merdeka",
    title: "PROTA Matematika Fase D 2024/2025 (Demo Merdeka)",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    year: "2024/2025",
    capaianPembelajaran: ["Memahami konsep bilangan dan operasinya", "Mengaplikasikan aljabar dalam pemecahan masalah"],
    semester1Components: [
      { topic: "Bilangan", elemenCapaianPembelajaran: ["Memahami sifat-sifat bilangan", "Operasi hitung"], alokasiWaktu: "30 JP" },
      { topic: "Aljabar Dasar", elemenCapaianPembelajaran: ["Ekspresi aljabar", "Persamaan linear"], alokasiWaktu: "36 JP" },
    ],
    semester2Components: [
      { topic: "Geometri", elemenCapaianPembelajaran: ["Bangun datar", "Bangun ruang"], alokasiWaktu: "30 JP" },
      { topic: "Statistika dan Peluang", elemenCapaianPembelajaran: ["Penyajian data", "Analisis data sederhana"], alokasiWaktu: "24 JP" },
    ],
    profilPelajarPancasilaFocus: ["Bernalar Kritis", "Kreatif"],
  },
];

export const initialSemesterProgramsData: Omit<SemesterProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
 {
    type: "Promes",
    curriculumType: "Kurikulum Merdeka",
    title: "Promes Matematika Fase D - Semester Ganjil 2024/2025 (Demo)",
    subject: "Matematika",
    gradeLevel: "Fase D (Kelas 7-9 SMP)",
    semester: "1",
    year: "2024/2025",
    capaianPembelajaranUmum: "Peserta didik menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 1.000.000.",
    alokasiWaktuTotalSemester: "18 Minggu Efektif x 4 JP/Minggu = 72 JP",
    komponenMingguan: [
      { mingguKe: 1, bulan: "Juli", materiPokokAtauTujuanPembelajaran: "Orientasi dan Asesmen Diagnostik Awal", alokasiWaktu: "4 JP", metodeStrategi: ["Diskusi", "Tes diagnostik"], sumberBelajar: ["Modul Ajar"], rencanaAsesmen: ["Observasi", "Hasil tes"], catatanIntegrasiP5: "Pengenalan nilai-nilai P5."},
      { mingguKe: 2, bulan: "Juli", materiPokokAtauTujuanPembelajaran: "Bilangan: Membaca dan Menulis Bilangan Cacah", alokasiWaktu: "4 JP", metodeStrategi: ["Permainan kartu angka", "Latihan terbimbing"], sumberBelajar: ["Buku Siswa Bab 1"], rencanaAsesmen: ["Kinerja membaca bilangan", "Lembar kerja"], catatanIntegrasiP5: "Ketelitian (Mandiri)"},
    ],
  },
];

export const initialModulAjarData: Omit<ModulAjar, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId' | 'curriculumType'>[] = [
  // Add a sample ModulAjar if needed for demo purposes
];

export const initialSubjectsData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
  { name: "Matematika Wajib (Demo)", code: "MTK-WAJIB-DEMO" },
  { name: "Bahasa Indonesia (Demo)", code: "IND-DEMO" },
];

export const initialTeachersData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
  // Will be populated by default Guru user
];

export const initialClassesData: Omit<SchoolClass, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
  { name: "Kelas X Demo 1", gradeLevel: "Fase E (Kelas 10 SMA/MA/SMK/MAK)" },
  { name: "Kelas VII Demo A", gradeLevel: "Fase D (Kelas 7-9 SMP/MTs)" },
];

export const initialAcademicEventsData: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'schoolId'>[] = [
  {
    title: "Hari Kemerdekaan RI (Demo)",
    date: `${new Date().getFullYear()}-08-17`,
    type: "Libur Nasional",
    isNationalHoliday: true,
    description: "Peringatan Proklamasi Kemerdekaan Indonesia.",
  },
  {
    title: "Ujian Tengah Semester (Demo)",
    date: `${new Date().getFullYear()}-10-01`,
    endDate: `${new Date().getFullYear()}-10-07`,
    type: "Ujian Sekolah",
    description: "Periode Ujian Tengah Semester Ganjil.",
  },
];

