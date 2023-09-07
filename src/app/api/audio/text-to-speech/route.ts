import { NextResponse } from 'next/server';

import { AudioBlobResponse } from '@/types';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface TextToSpeechArgs {
  text: string;
  model_id: string;
  voice_settings: VoiceSettings;
}

export async function POST(request: Request) {
  const { aiResponse, voiceId } = (await request.json()) as {
    aiResponse: string;
    voiceId: string;
  };

  console.log('aiResponse: ', aiResponse);
  console.log('voiceId: ', voiceId);

  try {
    const args: TextToSpeechArgs = {
      text: aiResponse,
      model_id: process.env.ELEVEN_LABS_MODEL || 'eleven_monolingual_v1',
      voice_settings: {
        stability: parseFloat(process.env.ELEVEN_LABS_STABILITY || '0.21'),
        similarity_boost: parseFloat(
          process.env.ELEVEN_LABS_SIMILARITY_BOOST || '0.75'
        )
      }
    };
    console.log('args: ', args);
    console.log('api key: ', process.env.ELEVEN_LABS_API_KEY);
    const result = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY || ''
        },
        body: JSON.stringify(args)
      }
    );

    console.log('status: ', result.status);

    const buffer = await result.arrayBuffer();
    console.log('result: ', buffer);

    //const audioBlob = await result.blob();
    const audioBlob = new Blob([buffer]);

    console.log('blob: ', audioBlob.size);

    const response = new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });

    return response;
  } catch (error) {
    console.log('error: ', error);
    return NextResponse.json({ error: error });
  }
}
