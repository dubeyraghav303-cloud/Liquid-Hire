import { groq, modelName } from '@/lib/groq';
import { streamObject } from 'ai';
import { z } from 'zod';
// @ts-ignore
const pdf = require('pdf-parse');

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { fileBase64 } = await req.json();

        if (!fileBase64) {
            return new Response('No file data provided', { status: 400 });
        }

        const buffer = Buffer.from(fileBase64, 'base64');
        let resumeText = '';
        try {
            console.log("Parsing PDF...");
            const pdfData = await pdf(buffer);
            resumeText = pdfData.text;
        } catch (e) {
            console.error("PDF Parse Error:", e);
            return new Response('Failed to parse PDF', { status: 500 });
        }

        if (!resumeText || resumeText.length < 50) {
            return new Response('PDF is empty or not text-readable.', { status: 400 });
        }

        const roastSchema = z.object({
            roast_summary: z.string().describe("A ruthless, sarcastic, and funny summary of the resume."),
            burn_score: z.number().min(0).max(100).describe("A score from 0 to 100."),
            weak_points: z.array(z.string()).describe("List of weak points."),
        });

        const result = streamObject({
            model: groq(modelName),
            mode: 'json',
            schema: roastSchema,
            system: "You are 'Liquid', a ruthless, sarcastic, elite tech recruiter from Silicon Valley. Roast this resume. Be mean but accurate.",
            prompt: `RESUME TEXT:
${resumeText.slice(0, 15000)}`,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Roast API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
