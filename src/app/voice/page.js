'use client'

import { useState } from 'react'

export default function VoiceChanger() {
  const [text, setText] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const response = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const data = await response.blob()
    const audio = URL.createObjectURL(data)
    setAudioUrl(audio)
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">AI Voice Changer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows="4"
          className="w-full border p-2"
          placeholder="Enter text to convert to speech"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button className="bg-purple-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Processing...' : 'Generate Voice'}
        </button>
      </form>
      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
