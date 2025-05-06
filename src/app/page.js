'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateVoice = async () => {
    setLoading(true);
    setAudioUrl('');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (!token) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const res = await fetch('/api/fixedvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Voice generation failed: " + err.error);
      setLoading(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setLoading(false);
  };

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">AI Voice Changer</h1>
      <textarea
        className="w-full border p-2 rounded"
        rows={4}
        placeholder="Type your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={generateVoice}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
      {audioUrl && (
        <audio controls className="mt-4">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </main>
  );
}
