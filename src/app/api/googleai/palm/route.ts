import { NextResponse } from 'next/server';
import { v1beta2 } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';

import { PromptResponse } from '@/types';

const { TextServiceClient } = v1beta2;
const MODEL_NAME = 'models/text-bison-001';
const API_KEY = process.env.PALM_API_KEY || '';

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY)
});

async function sendPrompt(prompt: string) {
  try {
    // Doing it manually
    /*const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.PALM_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          prompt: { text: prompt }
        })
      }
    );

    const body = await response.json();
    console.log(body);*/

    const response = await client.generateText({
      model: MODEL_NAME,
      prompt: { text: prompt }
    });

    if (response[0].candidates)
      return response[0].candidates[0].output as string;
    else return 'error';
  } catch (error) {
    console.log('error: ', error);
    return 'error';
  }

  //return res;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const promptWord = searchParams.get('input');
  console.log('prompt: ', promptWord);
  try {
    if (promptWord) {
      const promptResponse = await sendPrompt(promptWord);
      console.log('response: ', promptResponse);
      return NextResponse.json({ response: promptResponse.trim() });
    } else {
      return NextResponse.json({ warning: 'No prompt input provided.' });
    }
  } catch (error) {
    console.log('error: ', error);
    return NextResponse.json({ error: error });
  }
}
