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
            console.log("Parsing PDF buffer of size:", buffer.length);
            const pdfData = await pdf(buffer);
            resumeText = pdfData.text;
            console.log("PDF Parsed successfully. Text length:", resumeText.length);
            console.log("First 100 chars:", resumeText.substring(0, 100));
        } catch (e) {
            console.error("PDF Parse Error Stack:", e);
            return new Response('Failed to parse PDF: ' + (e instanceof Error ? e.message : String(e)), { status: 500 });
        }

        if (!resumeText || resumeText.length < 50) {
            return new Response('PDF is empty or not text-readable (scanned images are not supported).', { status: 400 });
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
