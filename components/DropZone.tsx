import React, { useCallback } from 'react';
import { Upload, FileVideo, Music } from 'lucide-react';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  accept: 'video' | 'audio';
  label: string;
  subLabel?: string;
  currentFile?: File | null;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileAccepted, accept, label, subLabel, currentFile }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const fileType = file.type.split('/')[0];
        if (fileType === (accept === 'video' ? 'video' : 'audio')) {
          onFileAccepted(file);
        } else {
            alert(`Por favor sube un archivo de ${accept === 'video' ? 'vídeo' : 'audio'}.`);
        }
      }
    },
    [onFileAccepted, accept]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileAccepted(e.target.files[0]);
    }
  };

  const Icon = accept === 'video' ? FileVideo : Music;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative group cursor-pointer 
        border-2 border-dashed rounded-xl p-8 
        flex flex-col items-center justify-center text-center
        transition-all duration-300
        ${currentFile 
          ? 'border-brand-cyan/50 bg-brand-cyan/5' 
          : 'border-slate-700 hover:border-brand-cyan hover:bg-slate-800'
        }
      `}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={accept === 'video' ? "video/*" : "audio/*"}
        onChange={handleInputChange}
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors ${currentFile ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-slate-800 text-slate-400 group-hover:text-brand-cyan'}`}>
        {currentFile ? <Icon size={32} /> : <Upload size={32} />}
      </div>

      <h3 className="text-lg font-semibold text-slate-200">
        {currentFile ? currentFile.name : label}
      </h3>
      {subLabel && !currentFile && (
        <p className="text-sm text-slate-500 mt-2">{subLabel}</p>
      )}
    </div>
  );
};

export default DropZone;