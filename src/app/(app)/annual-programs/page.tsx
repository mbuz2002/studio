"use client";

import { useState } from "react";
import { CurriculumDataTable } from "@/components/curriculum/CurriculumDataTable";
import { CurriculumFormDialog } from "@/components/curriculum/CurriculumFormDialog";
import type { AnnualProgram, AnyCurriculumItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, Filter, Search } from "lucide-react";

const initialAnnualPrograms: AnnualProgram[] = [
  {
    id: "prota1",
    type: "PROTA",
    title: "Mathematics Program 2023/2024",
    subject: "Mathematics",
    gradeLevel: "Grade 7",
    year: "2023/2024",
    semester1Topics: ["Algebra Basics", "Geometry Fundamentals"],
    semester2Topics: ["Statistics", "Advanced Algebra"],
    createdAt: new Date("2023-08-15T00:00:00Z").toISOString(),
    updatedAt: new Date("2023-08-20T00:00:00Z").toISOString(),
  },
  {
    id: "prota2",
    type: "PROTA",
    title: "Science Curriculum Grade 8",
    subject: "Science",
    gradeLevel: "Grade 8",
    year: "2023/2024",
    semester1Topics: ["Physics: Motion & Forces", "Chemistry: Elements & Compounds"],
    semester2Topics: ["Biology: Ecosystems", "Earth Science: Plate Tectonics"],
    createdAt: new Date("2023-08-10T00:00:00Z").toISOString(),
    updatedAt: new Date("2023-08-18T00:00:00Z").toISOString(),
  },
];

export default function AnnualProgramsPage() {
  const [annualPrograms, setAnnualPrograms] = useState<AnnualProgram[]>(initialAnnualPrograms);
  const [editingItem, setEditingItem] = useState<AnnualProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateOrUpdate = (itemData: AnyCurriculumItem) => {
    const newItem = itemData as AnnualProgram;
    if (editingItem) {
      setAnnualPrograms(annualPrograms.map(ap => ap.id === newItem.id ? newItem : ap));
    } else {
      setAnnualPrograms([newItem, ...annualPrograms]);
    }
    setEditingItem(null);
  };

  const handleEdit = (item: AnyCurriculumItem) => {
    setEditingItem(item as AnnualProgram);
  };

  const handleDelete = (itemToDelete: AnyCurriculumItem) => {
     if (window.confirm(`Are you sure you want to delete "${itemToDelete.title}"?`)) {
      setAnnualPrograms(annualPrograms.filter(ap => ap.id !== itemToDelete.id));
    }
  };

  const handleView = (item: AnyCurriculumItem) => {
    alert(`Viewing: ${item.title}\n\nDetails:\n${JSON.stringify(item, null, 2)}`);
  };

  const filteredAnnualPrograms = annualPrograms.filter(ap =>
    ap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.year.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Annual Programs (PROTA)</CardTitle>
          <CardDescription>Manage your academic year programs. Plan long-term curriculum goals and structures.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
             <div className="flex-grow relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search annual programs..."
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
              triggerButtonText="Create New Annual Program"
              dialogTitle="Create New Annual Program"
              dialogDescription="Define the structure for an entire academic year (PROTA)."
              itemType="PROTA"
              onSubmit={handleCreateOrUpdate}
              initialData={editingItem}
            />
          </div>
          <CurriculumDataTable
            items={filteredAnnualPrograms}
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
                dialogTitle={`Edit Annual Program: ${editingItem.title}`}
                dialogDescription="Update the details for this annual program."
                itemType="PROTA"
                initialData={editingItem}
                onSubmit={handleCreateOrUpdate}
            />
         </div>
      )}
    </div>
  );
}
