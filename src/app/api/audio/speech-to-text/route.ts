import { NextResponse } from 'next/server';

import { Configuration, OpenAIApi } from 'openai';

import { Readable } from 'stream';
import { Buffer } from 'node:buffer';

import { TranscriptionResponse } from '@/types';

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  //console.log('speech to text request: ', request);
  const requestFormData = await request.formData();
  const audioFile = requestFormData.get('file');

  console.log('speech file: ', audioFile);
  if (audioFile instanceof File) {
    console.log('audio file: ', audioFile.name, audioFile.type);
    try {
      const fileStream = Readable.from(
        Buffer.from(await audioFile.arrayBuffer())
      );
      // @ts-expect-error Workaround until OpenAI allows in memory objects
      fileStream.path = 'audio.webm';
      const transcriptResponse = await openai.createTranscription(
        fileStream as unknown as File,
        'whisper-1'
      );
      const transcript = transcriptResponse?.data.text || '';
      console.log('transcript: ', transcript);
      const response: TranscriptionResponse = {
        transcript: transcript
      };
      return NextResponse.json(response);
    } catch (error) {
      console.log('error: ', error);
      return NextResponse.json({ error: error });
    }
  }
}
