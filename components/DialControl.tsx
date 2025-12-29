
import React, { useState } from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import { Dial } from '../types';

interface DialControlProps {
  dial: Dial;
  index: number;
  max: number;
  color: string;
  onUpdate: (id: string, name: string, value: number, description?: string) => void;
  onRemove: (id: string) => void;
  formatCurrency: (val: number) => string;
}

const DialControl: React.FC<DialControlProps> = ({ 
  dial, index, max, color, onUpdate, onRemove, formatCurrency 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const glowShadow = isDragging 
    ? `0 10px 30px -5px ${color}44, 0 4px 15px -5px ${color}44` 
    : 'none';

  const percentage = (dial.value / (max || 1)) * 100;

  return (
    <div 
      className={`group space-y-3 p-5 rounded-[2rem] transition-all duration-500 ease-out border ${
        isDragging 
          ? 'bg-slate-800/60 border-slate-500/50 scale-[1.01] shadow-2xl' 
          : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/30 hover:border-slate-700/50'
      }`}
      style={{ boxShadow: glowShadow }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
             <div 
              className={`w-2 h-2 rounded-full transition-all duration-500 ${isDragging ? 'scale-150 shadow-[0_0_15px_currentColor]' : ''}`} 
              style={{ color, backgroundColor: 'currentColor' }}
            />
            <input 
              type="text"
              value={dial.name}
              onChange={(e) => onUpdate(dial.id, e.target.value, dial.value, dial.description)}
              className="bg-transparent border-none p-0 text-slate-100 font-bold text-base w-full focus:ring-0 placeholder:text-slate-700 transition-colors"
              placeholder="¿En qué quieres gastar?"
            />
          </div>
          <div className="flex items-center gap-2 pl-5">
            <button 
              onClick={() => setShowDesc(!showDesc)}
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${dial.description ? 'text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}
            >
              {dial.description ? '• Ver Propósito' : '+ Añadir Propósito'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className={`text-sm font-mono transition-all duration-300 ${isDragging ? 'text-white scale-110 font-bold' : 'text-slate-400'}`}>
            {formatCurrency(dial.value)}
          </span>
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">
            {percentage.toFixed(0)}% del máximo
          </span>
        </div>
      </div>

      {showDesc && (
        <div className="pl-5 animate-in slide-in-from-top-2 duration-300">
          <textarea
            value={dial.description || ''}
            onChange={(e) => onUpdate(dial.id, dial.name, dial.value, e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 placeholder:text-slate-700 focus:ring-1 focus:ring-purple-500/30 outline-none resize-none"
            placeholder="¿Por qué este gasto te hace feliz? (Ej: 'Me permite conectar con amigos')"
            rows={2}
          />
        </div>
      )}
      
      <div className="relative pt-2 group/slider">
        <input
          type="range"
          min="0"
          max={max}
          value={dial.value}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onUpdate(dial.id, dial.name, Number(e.target.value), dial.description)}
          style={{ accentColor: color }}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:brightness-110 transition-all"
        />
        
        <div className="flex justify-between mt-4">
           <button 
            onClick={() => onRemove(dial.id)}
            className="text-[10px] text-slate-700 hover:text-rose-500 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <Trash2 size={10} /> Eliminar
          </button>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${percentage > (i * 20) ? '' : 'bg-slate-800'}`}
                style={{ backgroundColor: percentage > (i * 20) ? color : undefined }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialControl;
