'use client';
import React, { useState } from 'react';
import Image from 'next/image';

import { ImagePrompt, ImagePromptResponse, PromptResponse } from '@/types';

const Prompt = () => {
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');

  const sendPrompt = async () => {
    console.log('input prompt: ', inputPrompt);
    const result = await fetch(
      `/api/prompt?input=${encodeURIComponent(inputPrompt)}`,
      {
        method: 'GET',
        mode: 'cors'
      }
    );

    const promptResponse = (await result.json()) as PromptResponse;

    if (promptResponse.response) {
      setResponses([...responses, promptResponse.response]);
    }
  };

  const sendImagePrompt = async () => {
    const imagePromptObj: ImagePrompt = {
      text: imagePrompt
    };
    console.log('test: ', imagePromptObj);
    const result = await fetch('/api/image', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(imagePromptObj)
    });

    const promptResponse = (await result.json()) as ImagePromptResponse;

    if (promptResponse.url) {
      setImageUrl(promptResponse.url);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Desired prompt..."
          onChange={(event) => {
            if (event.target.value) {
              setInputPrompt(event.target.value);
            } else {
              setInputPrompt('');
            }
          }}
        />
        <button
          disabled={inputPrompt === ''}
          onClick={() => {
            sendPrompt();
          }}
        >
          Send
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Image prompt..."
          onChange={(event) => {
            if (event.target.value) {
              setImagePrompt(event.target.value);
            } else {
              setImagePrompt('');
            }
          }}
        />
        <button
          disabled={imagePrompt === ''}
          onClick={() => {
            sendImagePrompt();
          }}
        >
          Send
        </button>
      </div>
      {responses.length > 0 && (
        <div>
          <ul>
            {responses.map((resp, i) => (
              <li key={`response-${i}`}>{resp}</li>
            ))}
          </ul>
        </div>
      )}
      {imageUrl !== '' && (
        <Image src={imageUrl} width="256" height="256" alt={imagePrompt} />
      )}
    </div>
  );
};

export default Prompt;
