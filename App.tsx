import React, { useState, useCallback } from 'react';
import { Scissors, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EditorState, INITIAL_STATE, ProcessingStatus } from './types';
import { ffmpegService } from './services/ffmpegService';
import DropZone from './components/DropZone';
import VideoPlayer from './components/VideoPlayer';
import Controls from './components/Controls';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);

  const updateState = (updates: Partial<EditorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    updateState({
      ...INITIAL_STATE,
      file,
      videoUrl: url,
    });
  };

  const handleProcessVideo = async () => {
    try {
      updateState({ 
        status: ProcessingStatus.LOADING_FFMPEG, 
        progress: 0, 
        errorMessage: null 
      });

      const outputUrl = await ffmpegService.processVideo(state, (progress) => {
        updateState({ status: ProcessingStatus.PROCESSING, progress });
      });

      updateState({ 
        status: ProcessingStatus.COMPLETED, 
        outputUrl 
      });
    } catch (error) {
      console.error(error);
      updateState({ 
        status: ProcessingStatus.ERROR, 
        errorMessage: "Error al procesar el vídeo. Asegúrate de usar un navegador moderno y un archivo válido." 
      });
    }
  };

  const downloadFile = () => {
    if (state.outputUrl) {
      const a = document.createElement('a');
      a.href = state.outputUrl;
      a.download = `aitors-trim-export.${state.selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      {/* Header */}
      <header className="py-6 border-b border-slate-800 bg-brand-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-brand-cyan to-blue-600 rounded-lg">
                <Scissors className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Aitor's <span className="text-brand-cyan">Video Trim</span>
            </h1>
          </div>
          <div className="hidden md:block text-sm text-slate-400 font-medium">
             Edición Profesional v1.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        
        {!state.file ? (
          <div className="mt-12 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-4">Recorta y Edita tus vídeos <span className="text-brand-cyan">gratis</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Sin marcas de agua. Sin subidas al servidor. Todo el procesamiento se realiza en tu dispositivo usando tecnología WebAssembly.
              </p>
            </div>
            <DropZone 
              accept="video" 
              label="Arrastra tu vídeo aquí" 
              subLabel="Soporta MP4, MOV, MKV, AVI, WEBM"
              onFileAccepted={handleVideoUpload} 
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center">
               <button 
                 onClick={() => setState(INITIAL_STATE)}
                 className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
               >
                 ← Subir otro vídeo
               </button>
               {state.status === ProcessingStatus.COMPLETED && (
                 <span className="flex items-center text-green-400 text-sm font-bold bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                   <CheckCircle2 className="w-4 h-4 mr-1" /> ¡Listo para descargar!
                 </span>
               )}
            </div>

            {/* Editor Area */}
            <div className="space-y-8">
              <VideoPlayer 
                state={state} 
                onTimeUpdate={(t) => updateState({ currentTime: t })}
                onDurationChange={(d) => updateState({ duration: d })}
                onTrimChange={(s, e) => updateState({ trimStart: s, trimEnd: e })}
              />

              <Controls state={state} onUpdate={updateState} />

              {/* Action Area */}
              <div className="pt-8 border-t border-slate-800 flex justify-center">
                {state.status === ProcessingStatus.IDLE || state.status === ProcessingStatus.ERROR || state.status === ProcessingStatus.COMPLETED ? (
                  <div className="flex flex-col items-center gap-4 w-full max-w-md">
                     {state.status === ProcessingStatus.ERROR && (
                        <div className="flex items-center text-red-400 bg-red-400/10 p-4 rounded-lg text-sm w-full">
                           <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                           {state.errorMessage}
                        </div>
                     )}

                     {state.status === ProcessingStatus.COMPLETED ? (
                         <button 
                           onClick={downloadFile}
                           className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 transition-all flex items-center justify-center transform hover:scale-[1.02]"
                         >
                           <Download className="mr-2" /> Descargar {state.selectedFormat.toUpperCase()}
                         </button>
                     ) : (
                         <button 
                           onClick={handleProcessVideo}
                           className="w-full py-4 bg-brand-cyan hover:bg-cyan-300 text-brand-dark rounded-xl font-bold text-lg shadow-lg shadow-brand-cyan/20 transition-all flex items-center justify-center transform hover:scale-[1.02]"
                         >
                           <Scissors className="mr-2" /> Recortar y Exportar
                         </button>
                     )}
                  </div>
                ) : (
                  <div className="w-full max-w-md text-center space-y-4">
                     <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-brand-cyan transition-all duration-300"
                          style={{ width: `${state.progress}%` }}
                        />
                     </div>
                     <div className="text-brand-cyan font-mono text-xl flex items-center justify-center animate-pulse">
                        <Loader2 className="animate-spin mr-2" />
                        {state.status === ProcessingStatus.LOADING_FFMPEG ? 'Cargando Motor...' : `Procesando: ${state.progress}%`}
                     </div>
                     <p className="text-slate-500 text-sm">Por favor espera, no cierres la pestaña.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;