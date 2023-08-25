import Image from 'next/image';
import styles from './page.module.css';

// UI
import Prompt from '@/app/client/prompt';
import AudioRecorder from '@/app/client/audio-recorder';
import ImageEditPrompt from '@/app/client/openai-image-edit';
import ImageGenPrompt from '@/app/client/openai-image-gen';
import InpaintPrompt from '@/app/client/inpaint';
import Transcriber from '@/app/client/transcriber';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <Prompt />
      </div>
      <div className={styles.description}>
        <AudioRecorder />
      </div>
      <div className={styles.description}>
        <Transcriber />
      </div>
      <div className={styles.description}>
        <ImageGenPrompt />
      </div>
      <div className={styles.description}>
        <ImageEditPrompt />
      </div>
      <div className={styles.description}>
        <InpaintPrompt />
      </div>
    </main>
  );
}
