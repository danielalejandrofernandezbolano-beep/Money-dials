
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Dial } from '../types';

interface DialControlProps {
  dial: Dial;
  index: number;
  max: number;
  color: string;
  onUpdate: (id: string, name: string, value: number) => void;
  onRemove: (id: string) => void;
  formatCurrency: (val: number) => string;
}

const DialControl: React.FC<DialControlProps> = ({ 
  dial, index, max, color, onUpdate, onRemove, formatCurrency 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Determinar la intensidad de la sombra basada en si se está arrastrando
  const glowShadow = isDragging 
    ? `0 10px 25px -5px ${color}33, 0 8px 10px -6px ${color}33` 
    : 'none';

  return (
    <div 
      className={`group space-y-3 p-4 rounded-2xl transition-all duration-300 ease-out border ${
        isDragging 
          ? 'bg-slate-800/50 border-slate-600/50 scale-[1.02] shadow-2xl' 
          : 'bg-slate-800/20 border-transparent hover:bg-slate-800/40 hover:border-slate-700/50'
      }`}
      style={{ boxShadow: glowShadow }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div 
            className={`w-3 h-3 rounded-full transition-all duration-500 ${isDragging ? 'scale-125 animate-pulse' : ''}`} 
            style={{ 
              backgroundColor: color, 
              boxShadow: isDragging ? `0 0 15px ${color}` : `0 0 8px ${color}60` 
            }}
          />
          <input 
            type="text"
            value={dial.name}
            onChange={(e) => onUpdate(dial.id, e.target.value, dial.value)}
            className="bg-transparent border-none p-0 text-slate-200 font-bold text-sm w-40 focus:ring-0 placeholder:text-slate-600 transition-colors focus:text-white"
            placeholder="Nombre de la perilla"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono transition-colors duration-300 ${isDragging ? 'text-white font-bold' : 'text-slate-400'}`}>
            {formatCurrency(dial.value)}
          </span>
          <button 
            onClick={() => onRemove(dial.id)}
            className="text-slate-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-400/10"
            title="Eliminar perilla"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="relative flex items-center group/slider">
        <input
          type="range"
          min="0"
          max={max}
          step={Math.max(1, Math.floor(max / 100))}
          value={dial.value}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => isDragging && setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onUpdate(dial.id, dial.name, Number(e.target.value))}
          style={{ accentColor: color }}
          className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer hover:brightness-125 transition-all outline-none"
        />
        
        {/* Indicador visual de progreso sutil detrás del slider nativo (opcional para estética) */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-l-lg pointer-events-none opacity-20 transition-all duration-300"
          style={{ 
            width: `${(dial.value / max) * 100}%`,
            backgroundColor: color,
            boxShadow: isDragging ? `0 0 10px ${color}` : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default DialControl;
