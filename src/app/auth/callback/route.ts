import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/settings'

    if (code) {
        const supabase = await createSupabaseServerClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.user) {
            if (!next || next === '/settings') {
                const { data: profile } = await supabase.from('profiles').select('full_name, date_of_birth, degree, stream, year_of_graduation, college, resume_text').eq('id', data.user.id).single()
                if (!profile?.full_name || !profile?.date_of_birth || !profile?.degree || !profile?.stream || !profile?.year_of_graduation || !profile?.college || !profile?.resume_text) {
                    next = '/onboarding'
                } else {
                    next = '/dashboard'
                }
            }

            if (typeof next === 'string' && next.startsWith('/')) {
                return NextResponse.redirect(`${origin}${next}`)
            }
            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=Could not exchange code`)
}
