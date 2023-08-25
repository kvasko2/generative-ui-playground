import { NextResponse } from 'next/server';

import { Configuration, OpenAIApi } from 'openai';

import { ImagePrompt, ImagePromptResponse } from '@/types';

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

async function sendPrompt(input: string) {
  const response = await openai.createImage({
    prompt: input,
    n: 1,
    size: '1024x1024'
  });

  const imageUrl = response.data.data[0].url;
  console.log('blarg:\n', response);

  return imageUrl;
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
