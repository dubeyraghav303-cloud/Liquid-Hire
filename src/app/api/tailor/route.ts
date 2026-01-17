import { google } from '@/lib/gemini';
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
        console.log("Fetching profile for user:", user.id);
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('resume_text, full_name, context_json, experience_json')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Profile Fetch Error:", profileError);
            return new Response('Database Error fetching profile', { status: 500 });
        }

        console.log("Profile found:", profile ? "Yes" : "No");
        console.log("Resume Text Length:", profile?.resume_text?.length || 0);

        if (!profile || !profile.resume_text) {
            console.error("Profile missing resume_text. Profile Object:", JSON.stringify(profile));
            return new Response('Profile or Resume not found in database. Please upload in Settings.', { status: 404 });
        }

        const tailorSchema = z.object({
            professional_summary: z.string().describe("A rewritten professional summary targeting the job."),
            experience_bullets: z.array(z.object({
                company: z.string(),
                role: z.string(),
                bullets: z.array(z.string()).describe("Rewritten bullet points for this role.")
            })).describe("Rewritten experience section."),
            skills_to_highlight: z.array(z.string()).describe("List of skills from the resume that match the JD."),
            cover_letter_snippet: z.string().describe("A concise paragraph for a cover letter or intro email.")
        });

        // Save the attempt (optional, or do it after generation)
        // We can't easily save streaming result mid-flight to DB without webhooks or client side save.
        // For now, let's just generate. Client will save.

        const result = streamObject({
            model: google('gemini-2.0-flash-exp'),
            schema: tailorSchema,
            prompt: `Act as a professional Resume Writer & Career Coach.
      
      You are tailoring a candidate's resume for a specific Job Description.
      
      JOB DESCRIPTION:
      ${jobDescription.slice(0, 10000)}

      CANDIDATE RESUME:
      ${profile.resume_text.slice(0, 15000)}

      INSTRUCTIONS:
      1. Rewrite the "Professional Summary" to specifically target the keywords in the Job Description. Use the same tone as the JD.
      2. Rewrite the "Experience Bullet Points" to emphasize relevant achievements. Do NOT lie, but rephrase existing skills to match.
      3. Identify key skills to highlight.
      4. Output strict JSON.
      `,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Tailor API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
