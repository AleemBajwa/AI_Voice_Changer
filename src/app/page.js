"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/login"
      }
    }

    checkSession()
  }, [])

  const generateVoice = async () => {
    setLoading(true)
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        alert("You must be logged in to generate voice.")
        window.location.href = "/login"
        return
      }

      const token = session.access_token

      const res = await fetch("/api/fixedvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ FIXED HERE
        },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()

      if (res.ok) {
        setAudioUrl(data.url)
      } else {
        alert("Voice generation failed: " + data.error)
      }
    } catch (err) {
      console.error("Error:", err)
      alert("An error occurred while generating voice.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Turn Text into Voice</h1>
      <textarea
        className="w-full max-w-xl h-32 p-4 rounded border border-green-500 text-black"
        placeholder="Type something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={generateVoice}
        disabled={loading}
        className="mt-4 px-6 py-3 bg-green-500 text-black font-semibold rounded hover:bg-green-600"
      >
        {loading ? "Generating..." : "Generate Voice"}
      </button>
      {audioUrl && (
        <audio controls className="mt-6">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
      <a
        href="/history"
        className="mt-4 text-blue-400 underline hover:text-blue-200"
      >
        View Generation History
      </a>
    </main>
  )
}
