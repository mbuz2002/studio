"use client";

import { useState } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { LessonPlan, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";

const initialLessonPlans: LessonPlan[] = [
  {
    id: "rpp1",
    type: "RPP",
    title: "Introduction to Algebra",
    subject: "Mathematics",
    gradeLevel: "Grade 7",
    topic: "Basic Algebraic Expressions",
    learningObjectives: ["Understand variables", "Solve simple equations"],
    activities: ["Lecture", "Group work", "Quiz"],
    assessment: "Worksheet and quiz",
    createdAt: new Date("2023-09-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2023-09-05T14:30:00Z").toISOString(),
  },
  {
    id: "rpp2",
    type: "RPP",
    title: "Photosynthesis Process",
    subject: "Science",
    gradeLevel: "Grade 8",
    topic: "Understanding Photosynthesis",
    learningObjectives: ["Explain the process", "Identify key components"],
    activities: ["Experiment", "Presentation", "Discussion"],
    assessment: "Lab report",
    materials: "Plants, light source, textbook",
    createdAt: new Date("2023-10-10T09:00:00Z").toISOString(),
    updatedAt: new Date("2023-10-12T11:00:00Z").toISOString(),
  },
];

export default function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(initialLessonPlans);
  const [editingItem, setEditingItem] = useState<LessonPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as LessonPlan; // Ensure type
    if (editingItem) {
      setLessonPlans(lessonPlans.map(lp => lp.id === newItem.id ? newItem : lp));
    } else {
      setLessonPlans([newItem, ...lessonPlans]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    setEditingItem(item as LessonPlan);
    // The dialog will open via its own state when editingItem is set, if dialog trigger is modified
    // For now, we assume CurriculumFormDialog's trigger is clicked again or it's controlled externally.
    // A better approach might be to control dialog's open state from here.
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (window.confirm(`Are you sure you want to delete "${itemToDelete.title}"?`)) {
      setLessonPlans(lessonPlans.filter(lp => lp.id !== itemToDelete.id));
    }
  };
  
  const handleView = (item: AnyCurriculumItem) => {
    alert(`Viewing: ${item.title}\n\nDetails:\n${JSON.stringify(item, null, 2)}`);
  };

  const filteredLessonPlans = lessonPlans.filter(lp =>
    lp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lp.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Lesson Plans (RPP)</CardTitle>
          <CardDescription>Manage your daily and weekly lesson plans. Create new plans, edit existing ones, or view details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-grow relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search lesson plans..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
             <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" /> Import Data
            </Button>
            <CurriculumFormDialog
              triggerButtonText="Create New Lesson Plan"
              dialogTitle="Create New Lesson Plan"
              dialogDescription="Fill in the details for your new lesson plan (RPP)."
              itemType="RPP"
              onSubmit={handleCreateOrUpdate}
              initialData={editingItem} // This will populate form if editingItem is set
            />
          </div>
          <CurriculumDataTable
            items={filteredLessonPlans}
            onView={handleView}
            onEdit={handleEdit} // This will set editingItem, then user clicks dialog trigger
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
       {/* If editingItem is set, this shows a pre-filled dialog for editing. This is a simple way.
           A more robust way would be to manage the dialog's open state from this parent component. */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingItem(null /* close if clicking outside (basic) */)} />
      )}
      {editingItem && (
         <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <CurriculumFormDialog
                triggerButtonText="Hidden Edit Trigger" // This button would ideally be hidden or controlled
                dialogTitle={`Edit Lesson Plan: ${editingItem.title}`}
                dialogDescription="Update the details for this lesson plan."
                itemType="RPP"
                initialData={editingItem}
                onSubmit={handleCreateOrUpdate}
            />
         </div>
      )}

    </div>
  );
}
