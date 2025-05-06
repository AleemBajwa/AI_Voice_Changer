'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [router])

  const generateVoice = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      alert('You must be logged in.')
      router.push('/login')
      return
    }

    const res = await fetch('/api/fixedvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert('Voice generation failed: ' + err.error)
      setLoading(false)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    setAudioUrl(url)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">AI Voice Changer</h1>
      <textarea
        className="w-full max-w-xl h-32 p-4 rounded text-black"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-4 bg-green-500 text-black px-6 py-2 rounded"
        onClick={generateVoice}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>

      {audioUrl && (
        <audio className="mt-6" controls src={audioUrl}></audio>
      )}
    </main>
  )
}
