import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, CalendarDays, CalendarClock, Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const featureCards = [
  {
    title: "Lesson Plans (RPP)",
    description: "Create, edit, and manage your daily or weekly lesson plans.",
    icon: BookOpenText,
    href: "/lesson-plans",
    image: "https://picsum.photos/seed/lessonplan/600/400",
    aiHint: "classroom books"
  },
  {
    title: "Annual Programs (PROTA)",
    description: "Plan your curriculum for the entire academic year.",
    icon: CalendarDays,
    href: "/annual-programs",
    image: "https://picsum.photos/seed/annualprogram/600/400",
    aiHint: "calendar planning"
  },
  {
    title: "Semester Programs (Promes)",
    description: "Detail your teaching schedule for each semester.",
    icon: CalendarClock,
    href: "/semester-programs",
    image: "https://picsum.photos/seed/semesterprogram/600/400",
    aiHint: "planner desk"
  },
  {
    title: "AI Assistant",
    description: "Get AI-powered suggestions to enhance your teaching materials.",
    icon: Sparkles,
    href: "/ai-assistant",
    image: "https://picsum.photos/seed/aiassistant/600/400",
    aiHint: "artificial intelligence"
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to EduAI Planner!</CardTitle>
          <CardDescription className="text-lg">
            Your intelligent assistant for streamlined curriculum planning and management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Efficiently create, organize, and enhance your lesson plans (RPP), annual programs (PROTA), and semester programs (Promes) with the power of AI. 
            Get started by exploring the features below or create a new curriculum item.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/lesson-plans"> {/* Or a generic "create new" page */}
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Plan
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
                  Go to {feature.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
