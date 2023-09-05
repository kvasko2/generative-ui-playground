'use client';
import React, { useState } from 'react';

import { PromptResponse } from '@/types';

const PalmPrompt = () => {
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [responses, setResponses] = useState<string[]>([]);

  const sendPrompt = async () => {
    console.log('input prompt: ', inputPrompt);
    const result = await fetch(
      `/api/googleai/palm?input=${encodeURIComponent(inputPrompt)}`,
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

  return (
    <div>
      <h1>Google Palm 2</h1>
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
      {responses.length > 0 && (
        <div>
          <ul>
            {responses.map((resp, i) => (
              <li key={`response-${i}`}>{resp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PalmPrompt;
