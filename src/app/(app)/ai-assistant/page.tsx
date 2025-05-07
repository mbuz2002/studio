"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { generateLessonPlanFromTopic, type GenerateLessonPlanOutput, type GenerateLessonPlanInput } from "@/ai/flows/generate-lesson-plan-from-topic";
import { suggestLessonPlanImprovements, type SuggestLessonPlanImprovementsOutput, type SuggestLessonPlanImprovementsInput } from "@/ai/flows/suggest-lesson-plan-improvements";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AIAssistantPage() {
  const { toast } = useToast();
  
  // State for Lesson Plan Generation
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GenerateLessonPlanOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for Improvement Suggestions
  const [draftPlan, setDraftPlan] = useState("");
  const [suggestedImprovements, setSuggestedImprovements] = useState<SuggestLessonPlanImprovementsOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !gradeLevel) {
      toast({ title: "Missing Information", description: "Please provide both topic and grade level.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedPlan(null);
    try {
      const input: GenerateLessonPlanInput = { topic, gradeLevel };
      const result = await generateLessonPlanFromTopic(input);
      setGeneratedPlan(result);
      toast({ title: "Lesson Plan Generated!", description: "AI has drafted a lesson plan for you." });
    } catch (error) {
      console.error("Error generating lesson plan:", error);
      toast({ title: "Generation Failed", description: "Could not generate lesson plan. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestImprovements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPlan) {
      toast({ title: "Missing Information", description: "Please provide a draft lesson plan.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    setSuggestedImprovements(null);
    try {
      const input: SuggestLessonPlanImprovementsInput = { lessonPlan: draftPlan };
      const result = await suggestLessonPlanImprovements(input);
      setSuggestedImprovements(result);
      toast({ title: "Suggestions Ready!", description: "AI has provided improvement suggestions." });
    } catch (error) {
      console.error("Error suggesting improvements:", error);
      toast({ title: "Suggestion Failed", description: "Could not get suggestions. Please try again.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">AI Assistant</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Leverage AI to kickstart your lesson planning or enhance existing materials.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate"><Wand2 className="mr-2 h-4 w-4 inline-block" />Generate New Plan</TabsTrigger>
          <TabsTrigger value="improve"><Sparkles className="mr-2 h-4 w-4 inline-block" />Improve Existing Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Lesson Plan</CardTitle>
              <CardDescription>Provide a topic and grade level to generate a draft lesson plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Solar System" />
                </div>
                <div>
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger id="gradeLevel">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</SelectItem>
                      ))}
                       <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                       <SelectItem value="Higher Education">Higher Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isGenerating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Plan
                </Button>
              </form>
              {generatedPlan && (
                <div className="mt-6 space-y-4 rounded-md border p-4 bg-secondary/50">
                  <h3 className="text-xl font-semibold text-primary">{generatedPlan.title}</h3>
                  <div>
                    <h4 className="font-semibold">Learning Objectives:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {generatedPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Suggested Activities:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {generatedPlan.suggestedActivities.map((act, i) => <li key={i}>{act}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="improve">
          <Card>
            <CardHeader>
              <CardTitle>Suggest Improvements</CardTitle>
              <CardDescription>Paste your draft lesson plan below to get AI-powered suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSuggestImprovements} className="space-y-4">
                <div>
                  <Label htmlFor="draftPlan">Draft Lesson Plan Content</Label>
                  <Textarea
                    id="draftPlan"
                    value={draftPlan}
                    onChange={(e) => setDraftPlan(e.target.value)}
                    placeholder="Paste your lesson plan text here..."
                    rows={10}
                  />
                </div>
                <Button type="submit" disabled={isSuggesting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Get Suggestions
                </Button>
              </form>
              {suggestedImprovements && (
                <div className="mt-6 space-y-4 rounded-md border p-4 bg-secondary/50">
                  <h3 className="text-xl font-semibold text-primary">Improvement Suggestions</h3>
                  <div>
                    <h4 className="font-semibold">Learning Objectives:</h4>
                    <p className="text-sm">{suggestedImprovements.learningObjectives}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Teaching Methods:</h4>
                    <p className="text-sm">{suggestedImprovements.teachingMethods}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Related Materials:</h4>
                    <p className="text-sm">{suggestedImprovements.relatedMaterials}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
