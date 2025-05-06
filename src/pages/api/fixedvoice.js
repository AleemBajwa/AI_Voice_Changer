import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    console.error("🔥 FINAL SERVER ERROR: No token provided");
    return res.status(401).json({ error: "No token provided" });
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

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error("Invalid Supabase session");

    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (creditError || !creditData || creditData.credits <= 0) {
      throw new Error("Insufficient credits or credit fetch error");
    }

    const { text } = req.body;
    if (!text || typeof text !== "string") throw new Error("Invalid or missing text");

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
      return res.status(500).json({ error: "Voice API failed", details: errorText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await supabase
      .from("credits")
      .update({ credits: creditData.credits - 1 })
      .eq("user_id", user.id);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);

  } catch (err) {
    console.error("🔥 FINAL SERVER ERROR:", err.message || err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
