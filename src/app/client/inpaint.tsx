'use client';
import React, { useState } from 'react';
import Image from 'next/image';

import { ImagePrompt, ImagePromptResponse, PromptResponse } from '@/types';

const InpaintPrompt = () => {
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  const sendImagePrompt = async () => {
    const imagePromptObj: ImagePrompt = {
      text: imagePrompt
    };
    console.log('🐱test: ', imagePromptObj);
    const result = await fetch('/api/stability/inpaint', {
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
          placeholder="Inpaint prompt.."
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
      {imageUrl !== '' && (
        <Image src={imageUrl} width="1024" height="1024" alt={imagePrompt} />
      )}
    </div>
  );
};

export default InpaintPrompt;
