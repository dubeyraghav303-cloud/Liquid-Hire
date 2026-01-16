import { google } from '@/lib/gemini';
import { streamObject } from 'ai';
import { z } from 'zod';
// @ts-ignore
const pdf = require('pdf-parse');

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow longer timeouts for parsing/generation

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response('No file uploaded', { status: 400 });
        }

        // Extract text from PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let resumeText = '';
        try {
            const pdfData = await pdf(buffer);
            resumeText = pdfData.text;
        } catch (e) {
            console.error("PDF Parse Error", e);
            return new Response('Failed to parse PDF', { status: 500 });
        }

        const roastSchema = z.object({
            roast_summary: z.string().describe("A ruthless, sarcastic, and funny summary of the resume."),
            burn_score: z.number().min(0).max(100).describe("A score from 0 to 100 indicating how bad the resume is."),
            weak_points: z.array(z.string()).describe("A list of specific weak points found in the resume."),
        });

        const result = streamObject({
            model: google('gemini-2.0-flash-exp'), // Using a fast/capable model
            schema: roastSchema,
            prompt: `You are 'Liquid', a ruthless, sarcastic, elite tech recruiter from Silicon Valley. 
      Roast this resume. Be mean but accurate. Mock generic skills (like 'MS Office'), point out vague metrics, and laugh at clichés.
      
      RESUME TEXT:
      ${resumeText.slice(0, 20000)} -- Truncate if too long
      `,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Roast API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
