'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const login = async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: ${location.origin}/auth/callback
        }
      })
    }
    login()
  }, [supabase])

  return <p>Redirecting to login...</p>
}
