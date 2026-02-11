import { gemini, modelName } from '@/lib/gemini';
import { streamObject } from 'ai';
import { z } from 'zod';
// @ts-ignore
const pdf = require('pdf-parse');

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
    console.log("DEBUG: Roast API hit!");
    try {
        const bodyText = await req.text(); // Read text first to debug payload
        console.log("DEBUG: Roast Request Body Size:", bodyText.length);

        let fileBase64;
        try {
            const json = JSON.parse(bodyText);
            fileBase64 = json.fileBase64;
        } catch (e) {
            console.error("DEBUG: JSON Parse Error:", e);
            return new Response('Invalid JSON body', { status: 400 });
        }

        if (!fileBase64) {
            return new Response('No file data provided', { status: 400 });
        }

        const buffer = Buffer.from(fileBase64, 'base64');
        let resumeText = '';
        try {
            console.log("Parsing PDF... Buffer length:", buffer.length);
            console.log("Buffer Header:", buffer.subarray(0, 10).toString());
            const pdfData = await pdf(buffer);
            resumeText = pdfData.text;
        } catch (e) {
            console.error("PDF Parse Error:", e);
            return new Response(`Failed to parse PDF: ${(e as Error).message}`, { status: 500 });
        }

        if (!resumeText || resumeText.length < 50) {
            console.log("Extracted Text:", resumeText);
            return new Response(`PDF is empty or not text-readable. Length: ${resumeText?.length}`, { status: 400 });
        }

        const roastSchema = z.object({
            roast_summary: z.string().describe("A ruthless, sarcastic, and funny summary of the resume."),
            burn_score: z.number().min(0).max(100).describe("A score from 0 to 100."),
            weak_points: z.array(z.string()).describe("List of weak points."),
        });

        const result = streamObject({
            model: gemini(modelName),
            // @ts-expect-error - 'mode' exists in runtime
            mode: 'json',
            schema: roastSchema,
            system: "You are 'Liquid', a ruthless, sarcastic, elite tech recruiter from Silicon Valley. Roast this resume. Be mean but accurate.",
            prompt: `RESUME TEXT:
${resumeText.slice(0, 15000)}`,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error('Roast API Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
