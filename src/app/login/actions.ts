'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    let target = '/dashboard'
    try {
        const supabase = await createSupabaseServerClient()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login error:', error)
            return { error: error.message }
        }

        if (data?.user) {
            const { data: profile } = await supabase.from('profiles').select('full_name, date_of_birth, degree, stream, year_of_graduation, college, resume_text').eq('id', data.user.id).single()
            if (!profile?.full_name || !profile?.date_of_birth || !profile?.degree || !profile?.stream || !profile?.year_of_graduation || !profile?.college || !profile?.resume_text) {
                target = '/onboarding'
            }
        }

        revalidatePath('/', 'layout')
    } catch (err) {
        console.error('Unexpected login error:', err)
        return { error: 'An unexpected error occurred during login' }
    }
    redirect(target)
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createSupabaseServerClient()
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const role = formData.get('role') as string

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            },
        })

        if (error) {
            console.error('Signup error:', error)
            return { error: error.message }
        }

        return { success: true, message: 'Check your email to verify account' }
    } catch (err) {
        console.error('Unexpected signup error:', err)
        return { error: 'An unexpected error occurred during signup' }
    }
}
