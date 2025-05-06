// src/app/page.js

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
  const [audioUrl, setAudioUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!data?.session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [router])

  const generateVoice = async () => {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch('/api/fixedvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`, // ✅ FIXED THIS LINE
      },
      body: JSON.stringify({ text }),
    })

    const blob = await response.blob()
    setAudioUrl(URL.createObjectURL(blob))
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Turn Text into Voice</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full max-w-2xl h-40 p-4 text-black rounded border border-green-500 bg-gray-50 focus:outline-none mb-4"
        placeholder="Type something..."
      />
      <button
        onClick={generateVoice}
        className="bg-green-500 text-black font-semibold px-6 py-3 rounded hover:bg-green-600 transition"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-4 w-full max-w-2xl" />
      )}
      <a href="/history" className="text-blue-400 mt-4 underline">
        View Generation History
      </a>
    </div>
  )
}
