'use client';
import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

enum RecordingState {
  None = 0,
  Recording,
  Paused,
  Stopped
}

const mimeType = 'audio/webm';
const audioOptions: MediaRecorderOptions = { mimeType: mimeType };

const AudioRecorder = () => {
  const [permission, setPermission] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [audioStream, setAudioStream] = useState<MediaStream>();
  const [recordingState, setRecordingState] = useState<RecordingState>(
    RecordingState.None
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>();

  const [mediaRecorderSupported, setMediaRecorderSupported] =
    useState<boolean>(false);
  useEffect(() => {
    const mediaRecorderSupported = 'MediaRecorder' in window;
    setMediaRecorderSupported(mediaRecorderSupported);
  }, []);

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
    setAudioChunks([]);
    if (audioStream) {
      // Setup a new media recorder instance with the given stream
      const media = new MediaRecorder(audioStream, audioOptions);
      setMediaRecorder(media);
      media.start();

      let localAudioChunks: Blob[] = [];
      media.ondataavailable = (event: BlobEvent) => {
        console.log('meow');
        console.log('data: ', event.data);
        if (typeof event.data === 'undefined' || event.data.size === 0) return;
        console.log('bark: ', audioChunks);
        localAudioChunks.push(event.data);
      };

      setAudioChunks(localAudioChunks);
    }
  };

  const clearAudioChunks = () => {
    console.log('clear audio chunks: ', audioChunks.length);
    if (audioChunks.length > 0) {
      console.log('audio chunks length: ', audioChunks.length);
      // Create a new blob with all of the recorded audio
      const finalAudioBlob = new Blob(audioChunks, { type: mimeType });
      // Make a playable URL from the audio blob
      const audioUrl = URL.createObjectURL(finalAudioBlob);
      setAudioUrl(audioUrl);
      // Delete the audio blobs
      // setAudioChunks([]); Saving audio blobs to be sent to server
    }
  };

  const stopRecording = () => {
    console.log('stop recording');
    setRecordingState(RecordingState.Stopped);
    if (mediaRecorder) {
      mediaRecorder.stop();
      // This is not working as described
      mediaRecorder.onstop = clearAudioChunks;
    }
    setMediaRecorder(undefined);
  };

  const sendAudio = async () => {
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

      console.log('result: ', result);
    }
  };

  return (
    <>
      {mediaRecorderSupported ? (
        <div>
          <div>
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
                {recordingState === RecordingState.Recording
                  ? 'Stop'
                  : 'Record'}
              </button>
            )}
          </div>
          {audioUrl && (
            <div>
              <h4>Audio recording</h4>
              <audio src={audioUrl} controls />
              <span />
              <button onClick={sendAudio}>Speech to text</button>
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

export default AudioRecorder;
