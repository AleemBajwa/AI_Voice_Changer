'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return setError(error.message)

    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id })
    }

    router.push('/login')
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Signup</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <input type="email" className="w-full border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="w-full border p-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Sign Up</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
