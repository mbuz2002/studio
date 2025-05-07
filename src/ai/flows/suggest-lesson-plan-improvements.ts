// src/ai/flows/suggest-lesson-plan-improvements.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that provides AI-powered suggestions for improving a lesson plan.
 *
 * - suggestLessonPlanImprovements - A function that takes a draft lesson plan as input and returns suggestions for improvement.
 * - SuggestLessonPlanImprovementsInput - The input type for the suggestLessonPlanImprovements function.
 * - SuggestLessonPlanImprovementsOutput - The return type for the suggestLessonPlanImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLessonPlanImprovementsInputSchema = z.object({
  lessonPlan: z
    .string()
    .describe('The draft lesson plan to be improved.'),
});
export type SuggestLessonPlanImprovementsInput = z.infer<typeof SuggestLessonPlanImprovementsInputSchema>;

const SuggestLessonPlanImprovementsOutputSchema = z.object({
  learningObjectives: z
    .string()
    .describe('Suggested learning objectives for the lesson plan.'),
  teachingMethods: z
    .string()
    .describe('Suggested teaching methods for the lesson plan.'),
  relatedMaterials: z
    .string()
    .describe('Suggested related materials for the lesson plan.'),
});
export type SuggestLessonPlanImprovementsOutput = z.infer<typeof SuggestLessonPlanImprovementsOutputSchema>;

export async function suggestLessonPlanImprovements(
  input: SuggestLessonPlanImprovementsInput
): Promise<SuggestLessonPlanImprovementsOutput> {
  return suggestLessonPlanImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLessonPlanImprovementsPrompt',
  input: {schema: SuggestLessonPlanImprovementsInputSchema},
  output: {schema: SuggestLessonPlanImprovementsOutputSchema},
  prompt: `You are an AI assistant designed to help teachers improve their lesson plans. Analyze the following lesson plan and provide suggestions for improvement, including learning objectives, teaching methods, and related materials.

Lesson Plan:
{{lessonPlan}}`,
});

const suggestLessonPlanImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestLessonPlanImprovementsFlow',
    inputSchema: SuggestLessonPlanImprovementsInputSchema,
    outputSchema: SuggestLessonPlanImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
