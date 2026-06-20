import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { createAdminClient } from './admin'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export const getCachedUser = cache(async () => {
  const supabase = await createClient()
  return supabase.auth.getUser()
})

export const getCachedUserProfile = cache(async (userId: string) => {
  const supabaseAdmin = createAdminClient()
  return supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
})

