'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function HistoryPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()
      if (!user || userError) return

      const { data, error } = await supabase
        .from('voice_logs')
        .select('text, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setLogs(data)
      setLoading(false)
    }

    fetchLogs()
  }, [])

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Voice Generation History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index} style={{ marginBottom: 8 }}>
              <strong>{new Date(log.created_at).toLocaleString()}</strong>: {log.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
