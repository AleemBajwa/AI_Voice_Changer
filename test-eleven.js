import fetch from 'node-fetch';
import fs from 'fs';

const ELEVENLABS_API_KEY = 'sk_4234ee39add59da145536171e1cf50798f60a281ba9932d9';

const run = async () => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: 'Hello world from ElevenLabs!',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('API Error:', err);
    return;
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync('output.mp3', Buffer.from(buffer));
  console.log('✅ Voice saved as output.mp3');
};

run();