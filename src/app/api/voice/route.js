import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Authorization: Bearer 
      }
    }
  }
)

export async function POST(req) {
  const { text } = await req.json()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  if (data.credits <= 0) return NextResponse.json({ error: 'No credits' }, { status: 403 })

  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      }
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return new NextResponse(ElevenLabs API error: , { status: 500 })
  }

  const audio = await response.arrayBuffer()

  await supabase
    .from('users')
    .update({ credits: data.credits - 1 })
    .eq('id', user.id)

  return new NextResponse(audio, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
    }
  })
}
