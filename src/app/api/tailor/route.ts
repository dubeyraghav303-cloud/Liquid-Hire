import { groq, modelName } from '@/lib/groq';
import { streamObject } from 'ai';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { jobDescription, jobId } = await req.json();

        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Fetch user profile/resume info
        const { data: profile } = await supabase
            .from('profiles')
            .select('resume_text, full_name')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.resume_text) {
            return new Response('Profile or Resume not found in database.', { status: 404 });
        }

        const tailorSchema = z.object({
            professional_summary: z.string().describe("Rewritten summary targeting the job."),
            experience_bullets: z.array(z.object({
                company: z.string(),
                role: z.string(),
                bullets: z.array(z.string()).describe("Rewritten bullet points.")
            })),
            skills_to_highlight: z.array(z.string()).describe("Matching skills."),
            cover_letter_snippet: z.string().describe("Intro email snippet.")
        });

        const result = streamObject({
            model: groq(modelName),
            schema: tailorSchema,
            system: "You are a Resume Writer. Tailor the candidate's resume for the specific Job Description. Output strictly matching the schema.",
            prompt: `JOB:
${jobDescription.slice(0, 5000)}

RESUME:
${profile.resume_text.slice(0, 10000)}`,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Tailor API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
