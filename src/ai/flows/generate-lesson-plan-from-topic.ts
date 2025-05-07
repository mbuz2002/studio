// src/ai/flows/generate-lesson-plan-from-topic.ts
'use server';

/**
 * @fileOverview Generates a draft lesson plan from a given topic and grade level.
 *
 * - generateLessonPlanFromTopic - A function that generates a lesson plan.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlanFromTopic function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlanFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('The topic of the lesson plan.'),
  gradeLevel: z.string().describe('The grade level for the lesson plan.'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  title: z.string().describe('The title of the lesson plan.'),
  learningObjectives: z.array(z.string()).describe('The learning objectives for the lesson plan.'),
  suggestedActivities: z.array(z.string()).describe('The suggested activities for the lesson plan.'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlanFromTopic(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanFromTopicPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an experienced teacher. Generate a lesson plan for the following topic and grade level:

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}

The lesson plan should include a title, learning objectives, and suggested activities. Make sure the output matches the schema.
`,
});

const generateLessonPlanFromTopicFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFromTopicFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
