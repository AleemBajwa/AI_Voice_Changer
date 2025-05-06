import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: Bearer ,
        },
      }
    }
  )

  const { data: { user }, error: userError } = await authClient.auth.getUser()
  if (!user || userError) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (error || !data) return res.status(500).json({ error: 'Fetch failed' })
  if (data.credits <= 0) return res.status(403).json({ error: 'No credits' })

  const { text } = req.body
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
    return res.status(500).json({ error: `ElevenLabs API error: ${err}` })
  }

  const buffer = await response.arrayBuffer()

  // ? Log the voice generation
  await supabase.from('voice_logs').insert({
    user_id: user.id,
    text: text
  })

  await supabase
    .from('users')
    .update({ credits: data.credits - 1 })
    .eq('id', user.id)

  res.setHeader('Content-Type', 'audio/mpeg')
  res.status(200).send(Buffer.from(buffer))
}
