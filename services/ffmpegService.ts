import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { EditorState } from '../types';

class FFmpegService {
  private ffmpeg: FFmpeg;
  private loaded: boolean = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  async load() {
    if (this.loaded) return;

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    // Load FFmpeg with specific core/wasm paths to avoid MIME issues in some envs
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.loaded = true;
  }

  async processVideo(
    state: EditorState,
    onProgress: (progress: number) => void
  ): Promise<string> {
    if (!this.loaded) await this.load();
    if (!state.file) throw new Error("No video file selected");

    const { 
      file, audioFile, trimStart, trimEnd, 
      transitionStart, transitionEnd, transitionType, 
      selectedFormat 
    } = state;

    const inputName = 'input.mp4';
    const audioInputName = 'audio.mp3';
    const outputName = `output.${selectedFormat}`;

    // Write video file to memory
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // Write audio file if exists
    if (audioFile) {
      await this.ffmpeg.writeFile(audioInputName, await fetchFile(audioFile));
    }

    // FFmpeg progress handler
    this.ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });

    const duration = trimEnd - trimStart;
    const args: string[] = [];

    // 1. Input Video (Trimmed via seeking)
    args.push('-ss', trimStart.toString());
    args.push('-to', trimEnd.toString());
    args.push('-i', inputName);

    // 2. Input Audio (if exists)
    if (audioFile) {
        // Apply offset to start reading audio from specific timestamp
        args.push('-ss', state.audioOffset.toString());
        args.push('-i', audioInputName);
    }

    // 3. Video Filters (Transitions & Scaling)
    let filterChain: string[] = [];
    
    // Transitions
    if (transitionType === 'fade') {
         if (transitionStart > 0) filterChain.push(`fade=t=in:st=0:d=${transitionStart}`);
         if (transitionEnd > 0) filterChain.push(`fade=t=out:st=${duration - transitionEnd}:d=${transitionEnd}`);
    } else if (transitionType === 'pixelate') {
         // Placeholder for pixelate logic if needed in future
    }
    
    // GIF specific filters
    if (selectedFormat === 'gif') {
        filterChain.push(`fps=10,scale=320:-1:flags=lanczos`);
    }

    if (filterChain.length > 0) {
        args.push('-vf', filterChain.join(','));
    }

    // 4. Encoding & Output Settings
    if (selectedFormat === 'gif') {
        args.push('-f', 'gif');
    } else {
        // Codecs
        if (selectedFormat === 'webm') {
            args.push('-c:v', 'libvpx-vp9');
            args.push('-c:a', 'libvorbis');
        } else {
            args.push('-c:v', 'libx264');
            args.push('-preset', 'ultrafast');
            args.push('-c:a', 'aac');
        }

        // Map Audio if replaced
        if (audioFile) {
             args.push('-map', '0:v'); // Video from first input
             args.push('-map', '1:a'); // Audio from second input
             args.push('-shortest');   // Finish when the shortest stream ends
        }
    }

    args.push(outputName);

    // Execute FFmpeg
    await this.ffmpeg.exec(args);

    // Read result
    const data = await this.ffmpeg.readFile(outputName);
    return URL.createObjectURL(new Blob([data], { type: selectedFormat === 'gif' ? 'image/gif' : `video/${selectedFormat}` }));
  }
}

export const ffmpegService = new FFmpegService();