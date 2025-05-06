'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)

    const supabase = createBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      alert("No session found. Redirecting to login.")
      window.location.href = "/login"
      return
    }

    const res = await fetch('/api/fixedvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    })

    const result = await res.json()
    setLoading(false)
    if (result.error) alert('Voice generation failed: ' + result.error)
    else alert('Voice generated!')
  }

  return (
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold mb-6">Turn Text into Voice</h1>
      <textarea
        className="w-full h-32 p-4 rounded border border-gray-500 bg-black text-white"
        placeholder="Type something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className="bg-green-500 text-white px-6 py-2 rounded mt-4"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
      <div className="mt-6">
        <a className="text-blue-500 underline" href="/history">
          View Generation History
        </a>
      </div>
    </div>
  )
}
