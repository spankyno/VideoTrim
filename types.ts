export enum ProcessingStatus {
  IDLE = 'IDLE',
  LOADING_FFMPEG = 'LOADING_FFMPEG',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type TransitionType = 'none' | 'fade' | 'pixelate';

export type ExportFormat = 'mp4' | 'webm';

export interface EditorState {
  file: File | null;
  videoUrl: string | null;
  audioFile: File | null;
  duration: number; // in seconds
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  transitionStart: number; // duration in seconds
  transitionEnd: number; // duration in seconds
  transitionType: TransitionType;
  audioOffset: number;
  status: ProcessingStatus;
  progress: number; // 0-100
  errorMessage: string | null;
  outputUrl: string | null;
  selectedFormat: ExportFormat;
}

export const INITIAL_STATE: EditorState = {
  file: null,
  videoUrl: null,
  audioFile: null,
  duration: 0,
  currentTime: 0,
  trimStart: 0,
  trimEnd: 0,
  transitionStart: 0,
  transitionEnd: 0,
  transitionType: 'none',
  audioOffset: 0,
  status: ProcessingStatus.IDLE,
  progress: 0,
  errorMessage: null,
  outputUrl: null,
  selectedFormat: 'mp4'
};