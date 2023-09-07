import { NextResponse } from 'next/server';

import { OpenAI } from 'langchain/llms/openai';
//import { PromptTemplate } from 'langchain/prompts';

import { PromptResponse } from '@/types';

const model = new OpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  temperature: 0.5
});

async function sendPrompt(input: string) {
  //const template = 'What invention in human history relates to {item}?';
  /*const prompt = new PromptTemplate({
    template,
    inputVariables: ['item']
  });*/

  //const res = await prompt.format({ item: input });

  const res = await model.call(`${input}`);

  return res;
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

export async function POST(request: Request) {
  console.log('image request: ', request);
  const { prompt } = (await request.json()) as { prompt: string };
  console.log('prompt: ', prompt);
  console.log('text: ', prompt);
  try {
    //console.log('**********', process.cwd());
    if (prompt) {
      const promptResponse = await sendPrompt(prompt);
      console.log('respnose: ', promptResponse);
      return NextResponse.json({ response: promptResponse.trim() });
    } else {
      return NextResponse.json({ warning: 'No prompt input provided.' });
    }
  } catch (error) {
    console.log('error: ', error);
    return NextResponse.json({ error: error });
  }
}
