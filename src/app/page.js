'use client'
import { useState } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Turn Text into Voice</h1>
      <form
        action="/api/fixedvoice"
        method="POST"
        className="w-full max-w-xl border p-6 rounded-lg border-green-500"
      >
        <textarea
          name="text"
          placeholder="Type something..."
          className="w-full h-40 p-4 mb-4 bg-black border border-green-500 text-white rounded resize-none"
        ></textarea>
        <button
          type="submit"
          className="w-full bg-green-500 text-black font-semibold py-2 rounded"
        >
          Generate Voice
        </button>
      </form>
      <a
        href="/history"
        className="mt-6 text-blue-400 hover:underline"
      >
        View Generation History
      </a>
    </main>
  )
}
