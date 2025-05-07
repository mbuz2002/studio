import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, CalendarDays, CalendarClock, Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const featureCards = [
  {
    title: "Rencana Pembelajaran (RPP)",
    description: "Buat, edit, dan kelola rencana pembelajaran harian atau mingguan Anda.",
    icon: BookOpenText,
    href: "/lesson-plans",
    image: "https://picsum.photos/seed/lessonplan/600/400",
    aiHint: "kelas buku"
  },
  {
    title: "Program Tahunan (PROTA)",
    description: "Rencanakan kurikulum Anda untuk seluruh tahun ajaran.",
    icon: CalendarDays,
    href: "/annual-programs",
    image: "https://picsum.photos/seed/annualprogram/600/400",
    aiHint: "kalender perencanaan"
  },
  {
    title: "Program Semester (Promes)",
    description: "Rincikan jadwal mengajar Anda untuk setiap semester.",
    icon: CalendarClock,
    href: "/semester-programs",
    image: "https://picsum.photos/seed/semesterprogram/600/400",
    aiHint: "perencana meja"
  },
  {
    title: "Asisten AI",
    description: "Dapatkan saran berbasis AI untuk meningkatkan materi pengajaran Anda.",
    icon: Sparkles,
    href: "/ai-assistant",
    image: "https://picsum.photos/seed/aiassistant/600/400",
    aiHint: "kecerdasan buatan"
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Selamat Datang di EduAI Planner!</CardTitle>
          <CardDescription className="text-lg">
            Asisten cerdas Anda untuk perencanaan dan manajemen kurikulum yang efisien.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Buat, atur, dan tingkatkan Rencana Pelaksanaan Pembelajaran (RPP), Program Tahunan (PROTA), dan Program Semester (Promes) Anda secara efisien dengan kekuatan AI. 
            Mulai dengan menjelajahi fitur di bawah atau buat item kurikulum baru.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/lesson-plans"> {/* Or a generic "create new" page */}
              <PlusCircle className="mr-2 h-5 w-5" /> Buat Rencana Baru
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {featureCards.map((feature) => (
          <Card key={feature.title} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 w-full">
              <Image 
                src={feature.image} 
                alt={feature.title} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={feature.aiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button asChild variant="outline" className="w-full">
                <Link href={feature.href}>
                  Buka {feature.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
