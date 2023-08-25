import { NextResponse } from 'next/server';

import { Configuration, OpenAIApi } from 'openai';

import { EmbeddingPrompt, EmbeddingResponse } from '@/types';

import fs from 'fs';

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

async function generateEmbeddings(embeddingPrompt: EmbeddingPrompt) {
  const embeddingResponse = await openai.createEmbedding({
    input: 'test',
    model: 'text-embedding-ada-002'
  });

  return embeddingResponse.data;
}

export async function POST(request: Request) {
  console.log('embedding request: ', request);
  const embeddingPrompt = (await request.json()) as EmbeddingPrompt;
  console.log('embedding prompt: ', embeddingPrompt);
  console.log('text: ', embeddingPrompt.input);
  try {
    //console.log('**********', process.cwd());
    if (embeddingPrompt.input) {
      const embeddingResponse = await generateEmbeddings(embeddingPrompt);
      const response: EmbeddingResponse = {
        object: 'test',
        embedding: []
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
