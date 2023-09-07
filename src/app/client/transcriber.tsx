'use client';
import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
// A beautiful library to help determine if somebody is speaking.
import hark, { Harker } from 'hark';
import { PromptResponse } from '@/types';

const prompt = `
Introduction:

You are Ava, the Echoing Digital Co-Host on "Imagine This!" Directly interact with the guests by addressing them personally and diving deep into their presented topics, emphasizing connections, implications, and insights. Keep responses concise, ideally under 100 words, and always engage directly with the guests.

Guidelines:
1. Engage with Depth: Echo guest points, connect patterns, and offer deeper insights. Move beyond mere summarization.
2. Maintain a Conversational Tone: Adopt a friendly and informal demeanor. Make sure your insights are direct and relatable.
3. Direct Address: Address the guest without overusing their name. Use phrases like "Regarding your statement..." or "Your point on..."
4. Echo Back: Emphasize key ideas by relating them to the guest's statements.
5. Anticipate Audience Queries: Integrate potential questions the wider audience might have.
6. Complement, Don’t Overshadow: Reinforce guest's points without dominating.
7. Scenario Testing: Explore topics deeply, providing clarifications or fact-checks as necessary.
8. Audience Simulation: Address broader concerns to ensure inclusive conversation.
9. Deep Dive: Bring up tangents or related sub-topics to provide deeper insights or anecdotes.
10. Challenge & Expand: Respond to challenging or controversial statements, adding depth without overshadowing.

Voice and Tone:
Warmth and clarity are key. Light humor or anecdotes, when appropriate, are encouraged.

Role Dynamics:
Actively listen and align with the direction and tone of the guest's discourse. Offer fact-checks, scenario illustrations, or insights based on the guest's queries or points.

Response Closure:
After sharing insights, transition the conversation back, prompting the guest for their thoughts or next point.

Domain-Specific Knowledge: Climate and Sustainability:
You are familiar with the 5 climate change scenarios for business strategies:
· Disruption & Dissonance: Scarce resources, climate inaction, nationalism rise.
· Regional Alliances: Green trade blocs with ties to resource pools and local supply chains.
· Coordinated Action: Notable climate agreement with diverse outcomes.
· Green Market Revolution: Private decarbonization leads, but inequality grows.
· Just Transition: Equitable green transition but at slower growth rates.

Remember the takeaways: Strategy testing against these scenarios, pinpointing vulnerabilities/opportunities, focusing on no-regret moves, and detecting early warning signals.

Introduction by Ava: Please introduce yourself. Keep your responses short and concise, under 100 words.

Please respond to the following conversation. Keep it brief, no more than 100 words: 
`;

enum RecordingState {
  None = 0,
  Recording,
  Paused,
  Stopped
}

const mimeType = 'audio/webm';
const audioOptions: MediaRecorderOptions = { mimeType: mimeType };

interface TranscriptionResponse {
  transcript: string;
}

const sendAudio = async (
  audioChunks: Blob[],
  handleResult: (transcribedChunk: string) => void
) => {
  console.log('send audio: ', audioChunks.length);
  if (audioChunks.length > 0) {
    const finalAudioBlob = new Blob(audioChunks, { type: mimeType });
    const audioFile = new File([finalAudioBlob], 'audiofile.webm', {
      type: mimeType
    });

    const formData = new FormData();
    formData.append('file', audioFile);

    const result = await fetch('/api/audio/speech-to-text', {
      method: 'POST',
      mode: 'cors',
      body: formData
    });

    const data = (await result.json()) as TranscriptionResponse;

    console.log('result: ', data.transcript);
    handleResult(data && data.transcript ? data.transcript : '');
  }
};

const requestResponse = async (conversation: string) => {
  const inputPrompt = `${prompt}\n${conversation}`;
  try {
    const result = await fetch(`/api/prompt`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: inputPrompt })
    });

    const promptResponse = (await result.json()) as PromptResponse;
    return promptResponse.response;
  } catch (error) {
    console.log('error: ', error);
    return;
  }
};

const responseToAudio = async (aiResponse: string) => {
  try {
    const result = await fetch(`/api/audio/text-to-speech`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aiResponse: aiResponse,
        voiceId: 'vwFpaBHlcYO2aUyLnfUk'
      })
    });

    const audioBlob = await result.blob();
    /*const audioFile = new File([audioBlob], 'response.mpeg', {
      type: 'audio/mpeg'
    });
    console.log('*****text to speech: ', audioFile.name);
    return audioFile;*/
    return audioBlob;
  } catch (error) {
    console.log('error: ', error);
    return;
  }
};

const Transcriber = () => {
  const [permission, setPermission] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [audioStream, setAudioStream] = useState<MediaStream>();
  const [recordingState, setRecordingState] = useState<RecordingState>(
    RecordingState.None
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>();

  const [listener, setListener] = useState<Harker>();

  const [mediaRecorderSupported, setMediaRecorderSupported] =
    useState<boolean>(false);
  useEffect(() => {
    const mediaRecorderSupported = 'MediaRecorder' in window;
    setMediaRecorderSupported(mediaRecorderSupported);
  }, []);

  const [latestTranscription, setLatestTrascription] = useState<string>('');
  const [conversation, setConversation] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string>();

  // Handle speech pauses
  const transcriptSpeechChunk = async () => {
    await pauseRecording();
    await resumeRecording();
  };

  const genAiResponse = async (currentConversation: string[]) => {
    const resp = await requestResponse(currentConversation.join(' '));

    setAiResponse(resp);

    if (resp) {
      console.log('response: ', resp);
      const responseVoiced = await responseToAudio(resp);

      if (responseVoiced) {
        console.log('blob: ', responseVoiced);
        const finalAudioBlob = new Blob([responseVoiced], { type: mimeType });
        const audioUrl = URL.createObjectURL(responseVoiced);
        setAudioUrl(audioUrl);
      }
    }
  };

  useEffect(() => {
    console.log('transcription: ', latestTranscription);
    if (
      latestTranscription !== '' &&
      typeof latestTranscription === 'string' &&
      !conversation.includes(latestTranscription)
    ) {
      if (
        latestTranscription &&
        latestTranscription.toLowerCase().includes('ava') &&
        latestTranscription.toLowerCase().includes('?')
      ) {
        console.log('should send to generative model');
        genAiResponse([...conversation, latestTranscription]);
      }

      setConversation([...conversation, latestTranscription]);
    }
  }, [latestTranscription, conversation]);

  const addToConversation = (transcribedChunk: string) => {
    if (transcribedChunk) {
      console.log('transcribed chunk: ', transcribedChunk.toLowerCase());
      setLatestTrascription(transcribedChunk);
    }
  };

  const getMicPermission = async () => {
    if (mediaRecorderSupported) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        setPermission(true);
        setAudioStream(streamData);
      } catch (error) {
        console.warn('Audio recorder error: ', error);
      }
    }
  };

  const startRecording = async () => {
    setRecordingState(RecordingState.Recording);
    console.log('start recording');
    // Reset the audio chunks
    //setAudioChunks([]);
    if (audioStream) {
      // Setup a new media recorder instance with the given stream
      const media = new MediaRecorder(audioStream, audioOptions);
      setMediaRecorder(media);
      //media.start();

      // Setup hark to capture speaking
      setListener(
        hark(audioStream, {
          interval: 100,
          play: false
        })
      );

      //let localAudioChunks: Blob[] = [];
      media.ondataavailable = (event: BlobEvent) => {
        console.log('data available: ', event.data.size);
        if (typeof event.data === 'undefined' || event.data.size === 0) return;
        //localAudioChunks.push(event.data);
        //setAudioChunks([...audioChunks, event.data]);
        sendAudio([event.data], addToConversation);
      };

      //setAudioChunks(localAudioChunks);
    }
  };

  const resumeRecording = async () => {
    setRecordingState(RecordingState.Recording);
    console.log('resume recording');
    // Reset the audio chunks
    setAudioChunks([]);
    if (audioStream && mediaRecorder) {
      mediaRecorder.start();
    }
  };

  const processAudioChunks = async (audioChunksLoc: Blob[]) => {
    console.log('clear audio chunks: ', audioChunksLoc.length);
    if (audioChunksLoc.length > 0) {
      console.log('audio chunks length: ', audioChunksLoc.length);
      await sendAudio([...audioChunksLoc], addToConversation);
      // Create a new blob with all of the recorded audio
      const finalAudioBlob = new Blob(audioChunksLoc, { type: mimeType });
      // Make a playable URL from the audio blob
      const audioUrl = URL.createObjectURL(finalAudioBlob);
      setAudioUrl(audioUrl);
      // Delete the audio blobs
      //setAudioChunks([]);
    }
  };

  const pauseRecording = async () => {
    console.log('pause recording');
    setRecordingState(RecordingState.Stopped);
    if (mediaRecorder) {
      //mediaRecorder.stop();
      // This is not working as described
      //mediaRecorder.onstop = async () => {
      await processAudioChunks(audioChunks);
      setAudioChunks([]);
      //};
    }
  };

  const stopRecording = async () => {
    console.log('stop recording');
    setRecordingState(RecordingState.Stopped);
    if (mediaRecorder) {
      mediaRecorder.stop();
      // This is not working as described
      mediaRecorder.onstop = async () => {
        await processAudioChunks(audioChunks);
        setAudioChunks([]);
      };
    }

    // Remove the hark event listeners
    if (listener) {
      listener.stop();
      /*listener.on('speaking', () => console.log('remove listener 1'));
      listener.on('stopped_speaking', () => console.log('remove listener 2'));*/
    }

    setListener(undefined);
    setMediaRecorder(undefined);
  };

  // Setup and destroy the speaking events
  useEffect(() => {
    if (listener) {
      listener.on('speaking', () => {
        console.log('speaking');
        //mediaRecorder?.start();
      });
      listener.on('stopped_speaking', () => {
        console.log('stopped speaking');
        mediaRecorder?.stop();
        transcriptSpeechChunk();
      });
    }
  }, [listener]);

  return (
    <>
      {mediaRecorderSupported ? (
        <div>
          <div>
            <h2>Live transcription</h2>
            <h3>Audio controls</h3>
            {!permission && (
              <button onClick={getMicPermission}>Init microphone</button>
            )}
            {permission && (
              <button
                onClick={
                  recordingState === RecordingState.Recording
                    ? stopRecording
                    : startRecording
                }
              >
                {recordingState === RecordingState.Recording ? 'Stop' : 'Start'}
              </button>
            )}
          </div>
          <div>
            <h3>Transcription</h3>
            <div>{conversation.join(' ')}</div>
          </div>
          <div>
            <h3>Responses</h3>
            <div>{aiResponse}</div>
          </div>
          {/*audioUrl && (
            <div>
              <h4>Audio recording</h4>
              <audio src={audioUrl} controls />
              <span />
              <button
                onClick={() =>
                  sendAudio([...audioChunks], addToConversation, transcription)
                }
              >
                Speech to text
              </button>
            </div>
              )*/}
          {audioUrl && (
            <div>
              <h4>Audio playback</h4>
              <audio src={audioUrl} autoPlay />
            </div>
          )}
          {audioUrl && (
            <div>
              <h4>Download MP3</h4>
              <button
                onClick={() => {
                  const mp3Blob = new Blob(audioChunks, { type: 'audio/mpeg' });
                  const mp3File = new File([mp3Blob], 'recording.mp3', {
                    type: 'audio/mpeg'
                  });
                  saveAs(mp3File, 'recording.mp3');
                }}
              >
                Download
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>😞</div>
      )}
    </>
  );
};

export default Transcriber;
