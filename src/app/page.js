'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [credits, setCredits] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setCredits(data.credits)
      }
    }

    fetchCredits()
  }, [])

  const generateVoice = async () => {
    setLoading(true)
    const res = await fetch('/api/voice', {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      const audio = await res.arrayBuffer()
      const blob = new Blob([audio], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      new Audio(url).play()

      setCredits(prev => prev - 1)
    } else {
      console.error(await res.text())
    }

    setLoading(false)
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">AI Voice Changer</h1>
      <p className="mb-2">Credits Left: {credits}</p>
      <textarea
        className="border rounded w-full p-2 mb-4"
        rows="4"
        placeholder="Enter text"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        onClick={generateVoice}
        disabled={loading || !text || credits <= 0}
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
      {credits === 0 && <p className="text-red-600 mt-2">You have no credits left.</p>}
    </main>
  )
}
