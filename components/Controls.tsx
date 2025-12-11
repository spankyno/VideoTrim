import React from 'react';
import { EditorState, TransitionType, ExportFormat } from '../types';
import { Sliders, Clock, MonitorPlay, Film } from 'lucide-react';
import DropZone from './DropZone';

interface ControlsProps {
  state: EditorState;
  onUpdate: (updates: Partial<EditorState>) => void;
}

const Controls: React.FC<ControlsProps> = ({ state, onUpdate }) => {
  const clipDuration = state.trimEnd - state.trimStart;
  const isGifAllowed = clipDuration <= 10;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Efectos y Transiciones */}
        <div className="bg-brand-surface rounded-xl p-6 border border-slate-700 space-y-6">
            <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                <Sliders className="w-5 h-5 mr-2 text-brand-cyan" />
                Efectos y Transiciones
            </h3>
            
            {/* Tipo de Transición */}
            <div className="space-y-2">
                <label className="text-sm text-slate-400">Estilo de Transición</label>
                <div className="grid grid-cols-3 gap-2">
                    {['none', 'fade', 'pixelate'].map((type) => (
                        <button
                            key={type}
                            onClick={() => onUpdate({ transitionType: type as TransitionType })}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                state.transitionType === type 
                                ? 'bg-brand-cyan text-brand-dark' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {type === 'none' ? 'Ninguna' : type === 'fade' ? 'Fundido' : 'Pixelar'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Duración de la transición */}
            {state.transitionType !== 'none' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Inicio (s)</label>
                        <input 
                            type="number" 
                            min="0" 
                            max="5" 
                            step="0.5"
                            value={state.transitionStart}
                            onChange={(e) => onUpdate({ transitionStart: parseFloat(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:border-brand-cyan focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Final (s)</label>
                        <input 
                            type="number" 
                            min="0" 
                            max="5" 
                            step="0.5"
                            value={state.transitionEnd}
                            onChange={(e) => onUpdate({ transitionEnd: parseFloat(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:border-brand-cyan focus:outline-none"
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Panel Derecho: Audio y Exportación */}
        <div className="space-y-6">
            {/* Audio Replacement */}
            <div className="bg-brand-surface rounded-xl p-6 border border-slate-700">
                <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                    <Clock className="w-5 h-5 mr-2 text-brand-cyan" />
                    Audio Personalizado
                </h3>
                
                {!state.audioFile ? (
                    <DropZone 
                        label="Arrastra un audio aquí para reemplazar" 
                        subLabel="(MP3, WAV)"
                        accept="audio" 
                        onFileAccepted={(f) => onUpdate({ audioFile: f })} 
                    />
                ) : (
                    <div className="space-y-4">
                         <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-600">
                             <div className="flex items-center truncate">
                                 <MonitorPlay className="w-4 h-4 mr-2 text-brand-cyan" />
                                 <span className="text-sm truncate max-w-[150px]">{state.audioFile.name}</span>
                             </div>
                             <button 
                                onClick={() => onUpdate({ audioFile: null, audioOffset: 0 })}
                                className="text-xs text-red-400 hover:text-red-300"
                             >
                                Eliminar
                             </button>
                         </div>
                         
                         <div className="space-y-2">
                            <label className="text-sm text-slate-400">Sincronización (Inicio en segundos)</label>
                            <input 
                                type="number"
                                value={state.audioOffset}
                                onChange={(e) => onUpdate({ audioOffset: parseFloat(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:border-brand-cyan focus:outline-none"
                            />
                         </div>
                    </div>
                )}
            </div>

            {/* Export Settings */}
            <div className="bg-brand-surface rounded-xl p-6 border border-slate-700">
                <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                    <Film className="w-5 h-5 mr-2 text-brand-cyan" />
                    Formato de Exportación
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => onUpdate({ selectedFormat: 'mp4' })}
                        className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                            state.selectedFormat === 'mp4' 
                            ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                            : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                    >
                        MP4
                    </button>
                    <button
                        onClick={() => onUpdate({ selectedFormat: 'webm' })}
                        className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                            state.selectedFormat === 'webm' 
                            ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                            : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                    >
                        WebM
                    </button>
                    <button
                        onClick={() => {
                            if (isGifAllowed) onUpdate({ selectedFormat: 'gif' });
                        }}
                        disabled={!isGifAllowed}
                        className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                            state.selectedFormat === 'gif' 
                            ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                            : 'bg-slate-800 border-slate-600 text-slate-400'
                        } ${!isGifAllowed ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500'}`}
                    >
                        GIF
                        {!isGifAllowed && <span className="block text-[10px] font-normal opacity-70">Sólo &le; 10s</span>}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Controls;