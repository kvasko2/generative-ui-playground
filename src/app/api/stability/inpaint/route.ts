import { NextResponse } from 'next/server';

import { generateAsync } from 'stability-client';

import { ImagePrompt, ImagePromptResponse } from '@/types';

async function sendPrompt(input: string) {
  const result = await generateAsync({
    prompt: input,
    apiKey: process.env.DREAMSTUDIO_API_KEY || '',
    width: 512,
    height: 512,
    cfgScale: 7
  });

  console.log('result: ', result);

  /*const imageUrl = response.data.data[0].url;
  console.log('blarg:\n', response);*/

  return 'kekw';
}

export async function POST(request: Request) {
  console.log('image request: ', request);
  const imagePrompt = (await request.json()) as ImagePrompt;
  console.log('image prompt: ', imagePrompt);
  console.log('text: ', imagePrompt.text);
  try {
    if (imagePrompt.text) {
      const imageUrl = await sendPrompt(imagePrompt.text);
      console.log('url: ', imageUrl);
      const response: ImagePromptResponse = {
        url: imageUrl
      };
      return NextResponse.json(response);
    } else {
      return NextResponse.json({ warning: 'No prompt input provided.' });
    }
  } catch (error) {
    console.log('error: ', error);
    return NextResponse.json({ error: error });
  }
}
