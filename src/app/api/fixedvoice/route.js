import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.error("🔥 FINAL SERVER ERROR: No token provided");
      return new Response(JSON.stringify({ error: "No token provided" }), { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error("🔥 FINAL SERVER ERROR: Invalid Supabase session");
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
    }

    console.log("✅ Logged-in user ID:", user.id);

    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditError || !creditData || creditData.credits <= 0) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 403 });
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Invalid or missing text" }), { status: 400 });
    }

    const voiceId = "EXAVITQu4vr4xnSDxMaL";

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔥 ElevenLabs Error:", errorText);
      return new Response(JSON.stringify({ error: "Voice API failed", details: errorText }), { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await supabase
      .from("credits")
      .update({ credits: creditData.credits - 1 })
      .eq("user_id", user.id);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (err) {
    console.error("🔥 FINAL SERVER ERROR:", err.message || err);
    return new Response(JSON.stringify({ error: "Internal Server Error", message: err.message }), { status: 500 });
  }
}
