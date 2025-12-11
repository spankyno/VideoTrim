import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-400 text-sm">
          Aitor Sánchez Gutiérrez © 2025 - Reservados todos los derechos
        </p>
        <p className="text-slate-600 text-xs mt-2">
          Procesamiento de vídeo seguro en el navegador. Ningún archivo se sube a servidores externos.
        </p>
      </div>
    </footer>
  );
};

export default Footer;