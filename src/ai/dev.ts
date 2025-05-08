
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-plan-from-topic.ts';
import '@/ai/flows/suggest-lesson-plan-improvements.ts';
import '@/ai/flows/export-rpp-to-text.ts';
import '@/ai/flows/generate-annual-program.ts';
import '@/ai/flows/generate-semester-program.ts';
import '@/ai/flows/generate-teaching-material.ts'; // Added new flow

    
