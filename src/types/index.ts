interface GenericResponse {
  error?: string;
  warning?: string;
}

export interface PromptResponse extends GenericResponse {
  response: string;
}

export interface ImagePrompt {
  text?: string;
}

export interface ImagePromptResponse extends GenericResponse {
  url?: string;
}

export interface TranscriptionResponse extends GenericResponse {
  transcript?: string;
}

export interface EmbeddingPrompt {
  input: string;
}

export interface EmbeddingResponse extends GenericResponse {
  object: string;
  embedding: number[];
}
