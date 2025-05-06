'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input className="mb-2 p-2 text-black" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="mb-2 p-2 text-black" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-black px-4 py-2 rounded" onClick={handleSignup}>Sign Up</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
