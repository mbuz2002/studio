"use client";

import { useState } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { SemesterProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";

const initialSemesterPrograms: SemesterProgram[] = [
  {
    id: "promes1",
    type: "Promes",
    title: "Mathematics Grade 7 - Semester 1",
    subject: "Mathematics",
    gradeLevel: "Grade 7",
    semester: "1",
    year: "2023/2024",
    weeklyBreakdown: [
      { week: 1, topic: "Introduction to Numbers", activities: "Worksheet" },
      { week: 2, topic: "Basic Operations", activities: "Group Project" },
    ],
    createdAt: new Date("2023-08-25T00:00:00Z").toISOString(),
    updatedAt: new Date("2023-08-28T00:00:00Z").toISOString(),
  },
  {
    id: "promes2",
    type: "Promes",
    title: "Science Grade 8 - Semester 2",
    subject: "Science",
    gradeLevel: "Grade 8",
    semester: "2",
    year: "2023/2024",
    weeklyBreakdown: [
      { week: 1, topic: "Ecosystem Dynamics", activities: "Field Trip" },
      { week: 2, topic: "Human Impact on Environment", activities: "Debate" },
    ],
    createdAt: new Date("2024-01-10T00:00:00Z").toISOString(),
    updatedAt: new Date("2024-01-15T00:00:00Z").toISOString(),
  },
];

export default function SemesterProgramsPage() {
  const [semesterPrograms, setSemesterPrograms] = useState<SemesterProgram[]>(initialSemesterPrograms);
  const [editingItem, setEditingItem] = useState<SemesterProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as SemesterProgram;
    if (editingItem) {
      setSemesterPrograms(semesterPrograms.map(sp => sp.id === newItem.id ? newItem : sp));
    } else {
      setSemesterPrograms([newItem, ...semesterPrograms]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    setEditingItem(item as SemesterProgram);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
    if (window.confirm(`Are you sure you want to delete "${itemToDelete.title}"?`)) {
      setSemesterPrograms(semesterPrograms.filter(sp => sp.id !== itemToDelete.id));
    }
  };

  const handleView = (item: AnyCurriculumItem) => {
    alert(`Viewing: ${item.title}\n\nDetails:\n${JSON.stringify(item, null, 2)}`);
  };

  const filteredSemesterPrograms = semesterPrograms.filter(sp =>
    sp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `Semester ${sp.semester}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Semester Programs (Promes)</CardTitle>
          <CardDescription>Detail your teaching plans for each semester. Organize weekly topics and activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-grow relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search semester programs..."
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
              triggerButtonText="Create New Semester Program"
              dialogTitle="Create New Semester Program"
              dialogDescription="Outline your curriculum for a specific semester (Promes)."
              itemType="Promes"
              onSubmit={handleCreateOrUpdate}
              initialData={editingItem}
            />
          </div>
          <CurriculumDataTable
            items={filteredSemesterPrograms}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingItem(null)} />
      )}
      {editingItem && (
         <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <CurriculumFormDialog
                triggerButtonText="Hidden Edit Trigger"
                dialogTitle={`Edit Semester Program: ${editingItem.title}`}
                dialogDescription="Update the details for this semester program."
                itemType="Promes"
                initialData={editingItem}
                onSubmit={handleCreateOrUpdate}
            />
         </div>
      )}
    </div>
  );
}
